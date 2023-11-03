import { z } from 'zod';

export const searchInput = z.object({
  keywords: z.union([z.string().array(), z.string()]),
  minSubs: z.number().min(0).default(1000),
  maxSubs: z.number().min(1).default(1000000),
  maxChannelsPerKeyword: z.number().min(1).default(100),
});

export type SearchInputType = z.infer<typeof searchInput>;
