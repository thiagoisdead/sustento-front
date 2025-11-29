import { z } from "zod";
import React from "react";

// --- Schema Definitions ---
export const eventSchema = z.object({
    id: z.number(),
    calendarDate: z.string(),
    time: z.string(),
    description: z.string(),
});

// Since RemoveButtonProps contains React specific types (React.Dispatch), 
// it's usually better to keep it as a TS type or interface, as Zod doesn't validate functions/React types at runtime well.
// However, if you really want to zod-ify the 'id', you can mix them.

// --- Type Inferences ---
export type Event = z.infer<typeof eventSchema>;

export type RemoveButtonProps = {
    id: number;
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
};