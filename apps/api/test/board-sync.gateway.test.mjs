import "reflect-metadata";
import assert from "node:assert/strict";
import { on } from "node:events";
import { test } from "node:test";
import { WsAdapter } from "@nestjs/platform-ws";
import { Test } from "@nestjs/testing";
import { BoardSyncGateway } from "../dist/modules/boards/board-sync.gateway.js";

const file = {
  id: "image-file",
  mimeType: "image/png",
  dataURL:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
  created: 0,
};
const fileWithMetadata = { ...file, lastRetrieved: 1000, version: 2 };
const element = { id: "image-element", isDeleted: false, type: "image", fileId: file.id };
const updatedElement = { ...element, x: 100 };

async function startRoom(t) {
  const module = await Test.createTestingModule({ providers: [BoardSyncGateway] }).compile();
  const app = module.createNestApplication({ logger: false });
  t.after(() => app.close());
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(0, "127.0.0.1");
  const url = new URL("/board-sync", await app.getUrl());
  url.protocol = "ws:";

  return async function connect() {
    const socket = new WebSocket(url);
    const messages = on(socket, "message", {
      close: ["close"],
      signal: AbortSignal.timeout(5000),
    });

    async function receive() {
      const { done, value } = await messages.next();
      assert.equal(done, false, "WebSocket closed before the expected message");
      return JSON.parse(value[0].data);
    }

    const snapshot = await receive();
    return {
      snapshot,
      receive,
      patch(element, baseRevision, files) {
        socket.send(
          JSON.stringify({ event: "patch", data: { changes: [{ element, baseRevision }], files } }),
        );
      },
    };
  };
}

test("BoardSyncGateway accepts an empty file dictionary", async (t) => {
  const connect = await startRoom(t);
  const sender = await connect();
  const peer = await connect();
  const rectangle = { id: "rectangle", type: "rectangle", isDeleted: false };
  const data = { elements: [{ element: rectangle, revision: 1 }], files: {} };

  sender.patch(rectangle, null, {});

  assert.deepEqual(await sender.receive(), { event: "patch", data: { ...data, own: true } });
  assert.deepEqual(await peer.receive(), { event: "patch", data });
});

for (const [name, validFile] of [
  ["with required fields", file],
  ["with lastRetrieved and version", fileWithMetadata],
  ["with the binary MIME type", { ...file, mimeType: "application/octet-stream" }],
]) {
  test(`BoardSyncGateway broadcasts and stores a valid file ${name}`, async (t) => {
    const connect = await startRoom(t);
    const sender = await connect();
    const peer = await connect();
    const files = { [file.id]: validFile };
    const data = { elements: [{ element, revision: 1 }], files };

    sender.patch(element, null, files);

    assert.deepEqual(await sender.receive(), { event: "patch", data: { ...data, own: true } });
    assert.deepEqual(await peer.receive(), { event: "patch", data });
    const newcomer = await connect();
    assert.deepEqual(newcomer.snapshot, { event: "snapshot", data });
  });
}

for (const [name, invalidFile] of [
  ["a null file", null],
  ["a file whose id differs from its key", { ...file, id: "different-id" }],
  ["a file without id", { ...file, id: undefined }],
  ["a file without mimeType", { ...file, mimeType: undefined }],
  ["a file without dataURL", { ...file, dataURL: undefined }],
  ["a file without created", { ...file, created: undefined }],
  ["a file with an unsupported MIME type", { ...file, mimeType: "text/plain" }],
  ["a file with an invalid lastRetrieved", { ...file, lastRetrieved: "1000" }],
  ["a file with an invalid version", { ...file, version: "2" }],
]) {
  test(`BoardSyncGateway rejects ${name} without changing the room`, async (t) => {
    const connect = await startRoom(t);
    const sender = await connect();
    const peer = await connect();
    const files = { [file.id]: fileWithMetadata };
    const data = { elements: [{ element, revision: 1 }], files };

    sender.patch(element, null, files);
    assert.deepEqual(await sender.receive(), { event: "patch", data: { ...data, own: true } });
    assert.deepEqual(await peer.receive(), { event: "patch", data });

    const pendingFile = { ...file, id: "pending-file" };
    sender.patch(updatedElement, 1, { [pendingFile.id]: pendingFile, [file.id]: invalidFile });
    assert.deepEqual(await sender.receive(), { event: "conflict", data: { elements: [] } });

    const newcomer = await connect();
    assert.deepEqual(newcomer.snapshot, { event: "snapshot", data });

    // The peer must receive this patch next, with no messages from the rejected patch.
    sender.patch(updatedElement, 1, {});
    const nextData = { elements: [{ element: updatedElement, revision: 2 }], files: {} };
    assert.deepEqual(await sender.receive(), { event: "patch", data: { ...nextData, own: true } });
    assert.deepEqual(await peer.receive(), { event: "patch", data: nextData });
  });
}
