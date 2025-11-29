import { z } from "zod";

// --- Schema Definitions ---
export const responseLoginSchema = z.object({
    token: z.string(),
    user_id: z.number(),
});

// --- Type Inferences ---
export type ResponseLogin = z.infer<typeof responseLoginSchema>;