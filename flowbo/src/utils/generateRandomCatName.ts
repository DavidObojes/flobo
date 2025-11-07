// src/utils/catNameGenerator.ts

// Import JSON data
import parts from "../data/cat-names.json";

type CatNameParts = {
  prefixes: string[];
  names: string[];
  suffixes: string[];
};

const { prefixes, names, suffixes } = parts as CatNameParts;

// Helper function to pick a random element from an array
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Options for name generation
type GenerateCatNameOptions = {
  usePrefixProb?: number;
  useSuffixProb?: number;
};

// Generate a random cat name
export function generateRandomCatName({
  usePrefixProb = 0.4,
  useSuffixProb = 0.5,
}: GenerateCatNameOptions = {}): string {
  const prefix = Math.random() < usePrefixProb ? pick(prefixes) + " " : "";
  const core = pick(names);
  const suffix = Math.random() < useSuffixProb ? " " + pick(suffixes) : "";
  return `${prefix}${core}${suffix}`;
}
