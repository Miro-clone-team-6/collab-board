import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { z } from "zod";

const elementSchema = z.looseObject({ id: z.string(), isDeleted: z.boolean() });
const patchSchema = z.object({
  changes: z.array(
    z.object({
      baseRevision: z.int().positive().nullable(),
      element: elementSchema,
    }),
  ),
  files: z.record(z.string(), z.unknown()),
});

type VersionedElement = { element: z.infer<typeof elementSchema>; revision: number };
type Peer = { readyState: number; send: (message: string) => void };

@WebSocketGateway({ path: "/board-sync" })
export class BoardSyncGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: { clients: Set<Peer> };

  private readonly elements = new Map<string, VersionedElement>();
  private readonly files: Record<string, unknown> = Object.create(null);
  private revision = 0;

  handleConnection(client: Peer) {
    client.send(
      JSON.stringify({
        event: "snapshot",
        data: { elements: [...this.elements.values()], files: this.files },
      }),
    );
  }

  @SubscribeMessage("patch")
  updateScene(@MessageBody() data: unknown, @ConnectedSocket() sender: Peer) {
    const result = patchSchema.safeParse(data);
    if (!result.success) {
      sender.send(JSON.stringify({ event: "conflict", data: { elements: [] } }));
      return;
    }

    const { changes, files } = result.data;
    const ids = new Set(changes.map(({ element }) => element.id));
    // Пакет применяется атомарно, чтобы стикер и его подпись менялись вместе.
    if (
      ids.size !== changes.length ||
      changes.some(
        ({ element, baseRevision }) =>
          (this.elements.get(element.id)?.revision ?? null) !== baseRevision,
      )
    ) {
      const elements = [...ids].flatMap((id) => this.elements.get(id) ?? []);
      sender.send(JSON.stringify({ event: "conflict", data: { elements } }));
      return;
    }

    const revision = ++this.revision;
    const elements = changes.map(({ element }) => {
      const entry = { element, revision };
      this.elements.set(element.id, entry);
      return entry;
    });
    Object.assign(this.files, files);
    const patch = { elements, files };
    const broadcast = JSON.stringify({ event: "patch", data: patch });
    const acknowledgement = JSON.stringify({ event: "patch", data: { ...patch, own: true } });
    for (const client of this.server.clients) {
      if (client.readyState === 1) client.send(client === sender ? acknowledgement : broadcast);
    }
  }
}
