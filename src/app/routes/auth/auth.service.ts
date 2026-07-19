import prisma from '../../../prisma/prisma-client';
import { ArticleInput } from './article-input.model';
import HttpException from '../../models/http-exception.model';
import profileMapper from '../profile/profile.utils';

export const listArticles = async (userId: number | null, query: any) => {
  const articles = await prisma.article.findMany({
    include: {
      author: { include: { followedBy: true } },
      favorites: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return articles.map((article) => ({
    ...article,
    author: profileMapper(article.author, userId),
    favorited: article.favorites.some((f) => f.userId === userId),
    favoritesCount: article.favorites.length,
  }));
};

export const getArticle = async (slug: string, userId: number | null) => {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { include: { followedBy: true } },
      favorites: true,
    },
  });

  if (!article) throw new HttpException(404, { errors: { article: ['not found'] } });

  return {
    ...article,
    author: profileMapper(article.author, userId),
    favorited: article.favorites.some((f) => f.userId === userId),
    favoritesCount: article.favorites.length,
  };
};

export const createArticle = async (input: ArticleInput, authorId: number) => {
  const article = await prisma.article.create({
    data: {
      title: input.title,
      description: input.description,
      body: input.body,
      slug: input.title.toLowerCase().replace(/ /g, '-'),
      authorId,
    },
    include: {
      author: { include: { followedBy: true } },
    },
  });

  return {
    ...article,
    author: profileMapper(article.author, authorId),
  };
};

export const updateArticle = async (slug: string, input: ArticleInput, authorId: number) => {
  const article = await prisma.article.update({
    where: { slug },
    data: {
      title: input.title,
      description: input.description,
      body: input.body,
    },
    include: {
      author: { include: { followedBy: true } },
    },
  });

  return {
    ...article,
    author: profileMapper(article.author, authorId),
  };
};

export const deleteArticle = async (slug: string) => {
  await prisma.article.delete({ where: { slug } });
};

export const favoriteArticle = async (slug: string, userId: number) => {
  await prisma.favorite.create({
    data: {
      userId,
      article: { connect: { slug } },
    },
  });
  return getArticle(slug, userId);
};

export const unfavoriteArticle = async (slug: string, userId: number) => {
  await prisma.favorite.deleteMany({
    where: {
      userId,
      article: { slug },
    },
  });
  return getArticle(slug, userId);
};
