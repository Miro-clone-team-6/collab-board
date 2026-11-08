/** Shared, framework-agnostic constants. */

/** Name of the product, used in page titles and emails. */
export const APP_NAME = 'collab-board';

/** Hard limit on how many objects a single board may hold. */
export const MAX_BOARD_OBJECTS = 10_000;

/** Realtime channel prefix used by the websocket gateway. */
export const BOARD_CHANNEL_PREFIX = 'board:';
