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

const gymsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    state: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
    suburb: z.string().optional(),
    equipment: z.array(z.string()).default([]),
    website: z.string().optional(),
    contact: z.string().optional(),
    featured: z.boolean().default(false),
    description: z.string().optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
  gyms: gymsCollection,
};
