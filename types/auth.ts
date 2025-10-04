import { z } from "zod";

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

export type Login = z.infer<typeof loginSchema>;
export type Registro = z.infer<typeof registerSchema>;