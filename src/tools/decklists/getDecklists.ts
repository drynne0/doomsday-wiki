import { join } from 'path';
import {
  BASE_DECKLISTS_URL,
  DECKLISTS_EXTENSION,
} from '@/tools/decklists/constants';
import type { Decklist, Decklists } from '@/tools/decklists/types';
import { formatDate } from '@/tools/io/formatDate';
import { readDecklist } from '@/tools/io/readDecklist';
import { walk } from '@/tools/io/walk';

type GetDecklists = () => Decklists;

/** Read file system and return all decklists. */
export const getDecklists: GetDecklists = () => {
  const extension = DECKLISTS_EXTENSION;
  const files = walk(BASE_DECKLISTS_URL, { extension });
  const decklists = files.reduce<Decklists>((accumulator, crumbs) => {
    const slug = join(...crumbs);
    const path = join(BASE_DECKLISTS_URL, slug) + extension;
    const decklist: Decklist = readDecklist(path);
    const [titleAsFile, ...dateCrumbs] = crumbs.reverse();
    const date: null | string = formatDate(...dateCrumbs.reverse());
    return { ...accumulator, [slug]: { ...decklist, date, titleAsFile } };
  }, {});
  return decklists;
};
