import type { Language } from "../languages";
import { en, type Dictionary } from "./en";
import { nl } from "./nl";

export type { Dictionary };

export const dictionaries: Record<Language, Dictionary> = { en, nl };
