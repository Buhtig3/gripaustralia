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
    sourceUrl: z.string().url().optional(),
    sourceName: z.string().optional(),
    verifiedAt: z.string().optional(),
    contentStatus: z.enum(['draft', 'verified', 'archived']).default('verified'),
    reviewAfter: z.string().optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
};
