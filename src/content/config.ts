import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    publishDate: z.coerce.date().optional(),
    migratedAt: z.string().optional(),
    originalUrl: z.string().optional(),
    author: z.string().default('Grip Australia'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  articles: articlesCollection,
};
