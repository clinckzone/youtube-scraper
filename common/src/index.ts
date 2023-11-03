import { z } from 'zod';

const wholeNumber = /^\d+$/;
export const searchInput = z.object({
  keywords: z.union([z.string().array(), z.string()]),
  minSubs: z.string().regex(wholeNumber).default('0'),
  maxSubs: z.string().regex(wholeNumber).default('1'),
  maxChannelsPerKeyword: z.string().regex(wholeNumber).default('1'),
});

export type SearchInputType = z.infer<typeof searchInput>;
