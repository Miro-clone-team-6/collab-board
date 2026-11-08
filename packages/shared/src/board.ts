import { z } from 'zod';

/** Kinds of object that can live on a board. */
export const boardObjectKindSchema = z.enum(['sticky', 'shape', 'text', 'connector', 'image']);

export type BoardObjectKind = z.infer<typeof boardObjectKindSchema>;

/** A point in board (not screen) coordinates. */
export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Point = z.infer<typeof pointSchema>;

/**
 * Placeholder board shape. Real fields land with the board feature —
 * this exists so the package has a non-trivial public API to import.
 */
export const boardSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(120),
  createdAt: z.coerce.date(),
});

export type Board = z.infer<typeof boardSchema>;
