import { join } from 'path';
import { readMarkdown } from '@/tools/io/readMarkdown';
import { formatDate } from '@/tools/io/formatDate';
import { walk } from '@/tools/io/walk';
import {
  BASE_ARTICLE_URL,
  MARKDOWN_EXTENSION,
} from '@/tools/markdown/constants';
import type { Document } from '@/tools/markdown/types';
import { readFirstArt } from '@/tools/scryfall/read';
import { scry } from '@/tools/scryfall/scry';
import type { ScryDataItem, ScryResponse } from '@/tools/scryfall/types';

/** Default options for the `getArticles` helper. */
const getArticlesOptionsDefault: GetArticlesOptions = {
  ascending: false,
};

interface GetArticlesOptions {
  ascending?: boolean;
}

type GetArticles = (options?: GetArticlesOptions) => Promise<Document[]>;

/** Read file system and return a list of all articles. */
export const getArticles: GetArticles = async (options) => {
  const { ascending } = { ...getArticlesOptionsDefault, ...options };
  const reduceFunction: 'reduce' | 'reduceRight' = ascending
    ? 'reduce'
    : 'reduceRight';
  const files = Array.from(walk(BASE_ARTICLE_URL, { depth: 4 }));
  const documents = files[reduceFunction]<Document[]>((accumulator, crumbs) => {
    // NOTE Only consider complete paths ie. [year, month, day, article]
    if (crumbs.length === 4) {
      const path = join(BASE_ARTICLE_URL, ...crumbs) + MARKDOWN_EXTENSION;
      let { data } = readMarkdown(path);
      const [year, month, day] = crumbs;
      // NOTE Warm up Scryfall query to be resolved later
      const bannerPromise = data.banner ? scry(data.banner) : null;
      data = { ...data, bannerPromise, date: formatDate(year, month, day) };
      const route = ['/articles', ...crumbs].join('/');
      return [...accumulator, { crumbs, data, route }];
    }
    return accumulator;
  }, []);
  // NOTE Wait for all banner promises, then update in place.
  //      This is suboptimal in that promises have to be resolved in sequence
  //      but reads more naturally and will prove easier to maintain for future
  //      contributors. Nevertheless, promises have already been initialized
  //      earlier so it's not completely inefficient.
  for (const document of documents) {
    if (document.data?.bannerPromise) {
      let response: ScryResponse;
      try {
        // eslint-disable-next-line no-await-in-loop
        response = await document.data.bannerPromise;
      } catch (error) {
        throw new Error(
          `Scryfall error while querying '${document.data.banner}' (${error.data.details})`
        );
      }
      const art: ScryDataItem['image_uris'] = readFirstArt(response.data);
      document.data.banner = art?.art_crop || null;
      document.data.bannerPromise = null;
    }
  }
  return documents;
};
