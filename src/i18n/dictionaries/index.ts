import type { Language } from "../languages";
import { en, type Dictionary } from "./en";
import { nl } from "./nl";

export type { Dictionary };

// Every supported language must have a complete dictionary (typed by `Record<Language, …>`).
export const dictionaries: Record<Language, Dictionary> = { en, nl };
