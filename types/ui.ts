import { z } from "zod";
import { StyleProp, ViewStyle } from "react-native";
import React from "react";

// --- Navigation Buttons (Zod is great here) ---
export const navButtonsSchema = z.object({
  Icon: z.any(), // Zod can't easily validate a React Component, so 'any' is pragmatic here
  name: z.string(),
  path: z.string(),
});

export const navButtonsSchemaArray = z.array(navButtonsSchema);

export type NavigationButton = z.infer<typeof navButtonsSchema>;
export type NavButtonsArray = z.infer<typeof navButtonsSchemaArray>;

// --- Component Props (Keep as TS Interface) ---
// Zod is not suitable for validating functions (onPress) or complex React types (children, style)
export interface AnimatedButtonProp {
  onPress: () => void;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
} 