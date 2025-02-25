import { DECK_RE } from '@/tools/decklists/constants';
import { toArray } from '@/tools/mana/toArray';

type Header = {
  authors: string | null;
  colors: string[] | null;
  title: string | null;
};

/**
 * Parse the header of a decklist buffer.
 * It usually looks like this:
 */
export const parseHeader = (text: string): Header => {
  const [, title = '', authors = '', colorsAsText = ''] =
    text.match(DECK_RE.header) || [];
  const colors: string[] = toArray(colorsAsText.trim());
  return {
    authors: authors.trim() || null,
    colors: colors.length ? colors : null,
    title: title.trim() || null,
  };
};
