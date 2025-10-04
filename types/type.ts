import { z } from 'zod';

export const loginSchema = z.object({
  password: z.string().min(2),
  email: z.string().email()
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  confirmPassword: z.string().min(2),
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
})

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
  user_id: z.string(),
  weight: z.string().nullable(),
  restrictions: z.string().nullable(),
});

export const navButtonsSchema = z.object({
  Icon: z.any(),
  name: z.string(),
  path: z.string(),
})

export const foodsSchema = z.object({
  title: z.string(),
  kcal: z.number(),
  carbs: z.number(),
  protein: z.number(),
  fats: z.number()
})

export const foodsSchemaArray = z.array(foodsSchema)
export const navButtonsSchemaArray = z.array(navButtonsSchema);

export type FoodsArray = z.infer<typeof foodsSchemaArray>
export type Foods = z.infer<typeof foodsSchema>
export type NavButtonsArray = z.infer<typeof navButtonsSchemaArray>;
export type NavigationButton = z.infer<typeof navButtonsSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Registro = z.infer<typeof registerSchema>;
export type User = z.infer<typeof userSchema>;
