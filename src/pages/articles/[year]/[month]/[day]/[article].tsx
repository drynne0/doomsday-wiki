import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { join } from 'path';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Banner } from '@/components/Banner/Banner';
import { Layout } from '@/components/Layout/Layout';
import { Remark } from '@/components/Remark/Remark';
import { getDecklists } from '@/tools/decklists/getDecklists';
import type { Decklists } from '@/tools/decklists/types';
import { getArticles } from '@/tools/markdown/getArticles';
import { getMarkdown } from '@/tools/markdown/getMarkdown';
import { getMenu } from '@/tools/markdown/getMenu';
import { getPartials } from '@/tools/markdown/getPartials';
import type {
  Document,
  Markdown,
  Menu,
  Partials,
} from '@/tools/markdown/types';

interface Props {
  decklists: Decklists;
  markdown: Markdown;
  menu: Menu;
  partials: Partials;
}

const ArticlePage: NextPage<Props> = ({
  decklists,
  markdown,
  menu,
  partials,
}) => {
  const { matter } = markdown;
  const { bannerData, title } = matter;

  if (!bannerData || !title) return null;

  return (
    <Layout menu={menu} title={title}>
      <Card>
        <Banner banner={bannerData} title={title} />
        <CardContent>
          <Remark
            decklists={decklists}
            markdown={markdown}
            partials={partials}
          />
        </CardContent>
      </Card>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const articles: Document[] = await getArticles();
  const paths = articles.map(({ crumbs }) => {
    const [year, month, day, article] = crumbs;
    return { params: { article, day, month, year } };
  });
  return { fallback: false, paths };
};

interface Query extends ParsedUrlQuery {
  article: string;
  day: string;
  month: string;
  year: string;
}

export const getStaticProps: GetStaticProps<Props, Query> = async ({
  params,
}) => ({
  props: {
    decklists: getDecklists(),
    markdown: await getMarkdown(
      join(
        'articles',
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        params!.year,
        params!.month,
        params!.day,
        params!.article
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
      )
    ),
    menu: getMenu(),
    partials: await getPartials(),
  },
});

export default ArticlePage;
