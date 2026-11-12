import { HttpStatus } from "@nestjs/common";

// Register public application error codes here when adding business modules.
export const applicationErrorStatuses = new Map<string, HttpStatus>([
  // ["USER_NOT_FOUND", HttpStatus.NOT_FOUND], // ApplicationError с code = "USER_NOT_FOUND" → HTTP 404
]);
