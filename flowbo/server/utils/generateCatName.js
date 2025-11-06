import parts from "../data/cat-names.json" with { type: "json" };
const { prefixes, names, suffixes } = parts;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function generateRandomCatName(
  { usePrefixProb = 0.4, useSuffixProb = 0.5 } = {}
) {
  const prefix = Math.random() < usePrefixProb ? pick(prefixes) + " " : "";
  const core   = pick(names);
  const suffix = Math.random() < useSuffixProb ? " " + pick(suffixes) : "";
  return `${prefix}${core}${suffix}`;
}
