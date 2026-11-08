import { APP_NAME, MAX_BOARD_OBJECTS } from '@collab-board/shared';

/**
 * App-wide configuration for the frontend.
 *
 * Values that the backend also needs live in `@collab-board/shared`;
 * this module only adapts them for UI consumption.
 */
export const appConfig = {
  name: APP_NAME,
  description: 'A collaborative whiteboard. Skeleton only — no features yet.',
  maxBoardObjects: MAX_BOARD_OBJECTS,
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? '',
} as const;
