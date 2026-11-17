import { Module } from "@nestjs/common";
import { WhiteboardGateway } from "./whiteboard.gateway.js";

@Module({
  providers: [WhiteboardGateway],
})
export class WhiteboardModule {}
