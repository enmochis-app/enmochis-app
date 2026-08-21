"use client";

import { createContext, useContext } from "react";

export type Theme = "blue" | "orange";

export const ThemeContext = createContext<Theme>("blue");

export function useTheme() {
  return useContext(ThemeContext);
}
