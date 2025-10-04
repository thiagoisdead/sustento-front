import { z } from 'zod';

export const navButtonsSchema = z.object({
  Icon: z.any(),
  name: z.string(),
  path: z.string(),
})

export const navButtonsSchemaArray = z.array(navButtonsSchema);
export type NavButtonsArray = z.infer<typeof navButtonsSchemaArray>;
export type NavigationButton = z.infer<typeof navButtonsSchema>; 