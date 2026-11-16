import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { z } from "zod";

// One disposable room. The last received whole-scene snapshot wins.
const sceneSchema = z.object({
  elements: z.array(z.looseObject({ id: z.string() })),
  files: z.record(z.string(), z.unknown()),
});

type Peer = { readyState: number; send: (message: string) => void };

@WebSocketGateway({ path: "/research/excalidraw" })
export class ExcalidrawGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: { clients: Set<Peer> };

  private scene: z.infer<typeof sceneSchema> = { elements: [], files: {} };

  handleConnection(client: Peer) {
    client.send(JSON.stringify({ event: "scene", data: this.scene }));
  }

  @SubscribeMessage("scene")
  updateScene(@MessageBody() data: unknown, @ConnectedSocket() sender: Peer) {
    const result = sceneSchema.safeParse(data);
    if (!result.success) return;
    this.scene = result.data;
    const message = JSON.stringify({ event: "scene", data: this.scene });
    for (const client of this.server.clients) {
      if (client !== sender && client.readyState === 1) client.send(message);
    }
  }
}
