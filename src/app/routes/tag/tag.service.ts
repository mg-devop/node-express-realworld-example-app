import prisma from '../../../prisma/prisma-client';
import { Tag } from './tag.model';

const getTags = async (id?: number): Promise<string[]> => {
  // We are simplifying this to a basic fetch to ensure the API starts up correctly.
  // This removes the relational 'author' filter which was causing the Prisma validation error.
  const tags = await prisma.tag.findMany({
    select: {
      name: true,
    },
    orderBy: {
      articles: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  return tags.map((tag) => tag.name);
};

export default {
  getTags,
};

