"use client";

import { useSyncDemo } from "@tldraw/sync";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

// Shared only by this experiment. Never pass real board IDs or production data here.
const ROOM_ID = "collab-board-research-tldraw-8c307fed-7c7b-476b-96ac-1560d2ac30b5";

export default function TldrawEditor() {
  const store = useSyncDemo({ roomId: ROOM_ID });

  return (
    <div className="absolute inset-0">
      <Tldraw store={store} />
    </div>
  );
}
