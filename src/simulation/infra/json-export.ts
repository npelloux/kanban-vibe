import type { z } from 'zod';
import type { Board } from '../domain/board/board';
import {
  BoardStateSchema,
  serializeBoard,
  deserializeBoard,
} from './board-serialization';

export type ImportError =
  | { type: 'INVALID_JSON'; message: string }
  | { type: 'VALIDATION_FAILED'; errors: z.ZodError };

export type ImportResult =
  | { success: true; value: Board }
  | { success: false; error: ImportError };

export function exportBoard(board: Board): Blob {
  const state = serializeBoard(board);
  const content = JSON.stringify(state, null, 2);
  return new Blob([content], { type: 'application/json' });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not produce string result'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export async function importBoard(file: File): Promise<ImportResult> {
  try {
    const text = await readFileAsText(file);
    const parsed: unknown = JSON.parse(text);
    const result = BoardStateSchema.safeParse(parsed);

    if (!result.success) {
      return {
        success: false,
        error: { type: 'VALIDATION_FAILED', errors: result.error },
      };
    }

    return {
      success: true,
      value: deserializeBoard(result.data),
    };
  } catch (e) {
    return {
      success: false,
      error: { type: 'INVALID_JSON', message: String(e) },
    };
  }
}
