import { z } from 'zod';

export const userSchema = z.object({
  active_plan_id: z.string().nullable(),
  activity_lvl: z.string().nullable(),
  age: z.string().nullable(),
  created_at: z.string(),
  email: z.string().email(),
  gender: z.string().nullable(),
  height: z.string().nullable(),
  bmi: z.string().nullable(),
  name: z.string(),
  objective: z.string().nullable(),
  updated_at: z.string(),
  user_id: z.number(),
  weight: z.string().nullable(),
  restrictions: z.array(z.string()).nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
});

export type User = z.infer<typeof userSchema>;

export const foodsSchema = z.object({
  title: z.string(),
  kcal: z.number(),
  carbs: z.number(),
  protein: z.number(),
  fats: z.number(),
  serving: z.enum(["portion", "g", "ml"]),
})

export const foodsSchemaArray = z.array(foodsSchema)
export type FoodsArray = z.infer<typeof foodsSchemaArray>
export type Foods = z.infer<typeof foodsSchema>