import { z } from 'zod';

export const userSchema = z.object({
  active_plan_id: z.string().nullable(),
  activity_lvl: z.string().nullable(),
  age: z.string().nullable(),
  created_at: z.string(),
  email: z.string().email(),
  gender: z.string().nullable(),
  weight: z.string().nullable(),
  height: z.string().nullable(),
  bmi: z.string().nullable(),
  name: z.string(),
  objective: z.string().nullable(),
  updated_at: z.string(),
  user_id: z.number(),
  restrictions: z.array(z.string()).nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
});

export type User = z.infer<typeof userSchema>;

export const foodsSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  brand: z.string().nullable(),
  imageUrl: z.string().nullable(),
  ingredients: z.string().nullable(),
  quantity: z.number().nullable(),

  nutrients: z.object({
    calories_100g: z.number(),
    carbs_100g: z.number(),
    fat_100g: z.number(),
    protein_100g: z.number(),
    fiber_100g: z.number(),
    saturatedFat_100g: z.number(),
    sodium_100g: z.number(),
    sugar_100g: z.number(),
  }),

  nutriScore: z.string(),
  novaGroup: z.number(),
  dietaryInfo: z.any().optional(),
  anvisaWarnings: z.any().optional(),
});


export const foodsSchemaArray = z.array(foodsSchema);
export type FoodsArray = z.infer<typeof foodsSchemaArray>;
export type Foods = z.infer<typeof foodsSchema>;