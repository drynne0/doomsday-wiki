import { existsSync, readdirSync } from 'fs';
import { join, parse } from 'path';

interface WalkOptions {
  depth?: number;
  extension?: string;
}

/**
 * Generator to walk through `directory` and yield all files.
 * Return a tuple containing all successive parent folders followed by the file
 * with their extension.
 * When `extension` is specified, only return files that match.
 * Prefer synchronous exploration since order matters.
 */
function* walkIterator(
  directory: string,
  options: WalkOptions = {},
  accumulator: string[] = []
): Generator<string[], void> {
  const { depth, extension } = options;
  if (accumulator.length === depth) return;
  if (existsSync(directory)) {
    // NOTE Looping over the stream requires the `--downlevelIteration` flag
    for (const file of readdirSync(directory, { withFileTypes: true })) {
      const { ext, name } = parse(file.name);
      if (file.isDirectory()) {
        const entry = join(directory, file.name);
        yield* walkIterator(entry, options, [...accumulator, file.name]);
      } else if (file.isFile() && (!extension || ext === extension)) {
        yield [...accumulator, name];
      }
    }
  }
}

type Walk = (directory: string, options?: WalkOptions) => string[][];

export const walk: Walk = (directory, options) =>
  Array.from(walkIterator(directory, options));
