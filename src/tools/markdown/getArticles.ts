import { join } from 'path';
import { readMarkdown } from '@/tools/io/readMarkdown';
import { formatDate } from '@/tools/io/formatDate';
import { walk } from '@/tools/io/walk';
import {
  BASE_ARTICLE_URL,
  MARKDOWN_EXTENSION,
} from '@/tools/markdown/constants';
import { getBanner } from '@/tools/markdown/getBanner';
import type { Banner, Document, Matter } from '@/tools/markdown/types';

interface GetArticlesOptions {
  ascending?: boolean;
}

type GetArticles = (options?: GetArticlesOptions) => Promise<Document[]>;

/** Read file system and return a list of all articles. */
export const getArticles: GetArticles = async (options) => {
  const { ascending } = { ascending: false, ...options };
  const reduceFunction: 'reduce' | 'reduceRight' = ascending
    ? 'reduce'
    : 'reduceRight';
  const files = Array.from(walk(BASE_ARTICLE_URL, { depth: 4 }));
  const documents = files[reduceFunction]<Document[]>((accumulator, crumbs) => {
    // NOTE Only consider complete paths ie. [year, month, day, article]
    if (crumbs.length === 4) {
      const path = join(BASE_ARTICLE_URL, ...crumbs) + MARKDOWN_EXTENSION;
      const { data } = readMarkdown(path);
      const [year, month, day, slug] = crumbs;
      const date = formatDate(year, month, day);
      if (!data.title || typeof data.title !== 'string') {
        throw new Error(`Missing title for article at "${path}"`);
      }
      if (!data.banner || typeof data.banner !== 'string') {
        throw new Error(`Missing banner for article at "${path}"`);
      }
      const matter = { ...data, date } as Matter;
      // @ts-expect-error Warm up promise in a temporary property.
      matter._bannerPromise = getBanner(data.banner);
      const route = ['/articles', ...crumbs].join('/');
      return [...accumulator, { crumbs, matter, route, slug }];
    }
    // TODO Warn against orphan files
    return accumulator;
  }, []);
  for (const document of documents) {
    let data: Banner;
    try {
      // @ts-expect-error The property has been force-added above.
      // eslint-disable-next-line no-await-in-loop
      data = await document.matter._bannerPromise;
    } catch (error) {
      const { banner } = document.matter;
      throw new Error(`Failed to scry for "${banner}" (${error})`);
    }
    // @ts-expect-error The property has been force-added above.
    delete document.matter._bannerPromise;
    document.matter.bannerData = data;
  }
  return documents;
};
