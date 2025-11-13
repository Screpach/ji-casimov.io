export type IntervalCategory = "basic" | "composed";

export interface IntervalDef {
  id: number;
  harmonic: number;
  name: string;
  ratio: [number, number]; // [a, b] => upper:lower
  category?: IntervalCategory;
  parentName?: string; // for composed intervals (e.g. "Major third")
}

export const JI_INTERVALS: IntervalDef[] = [
  { id: 1, harmonic: 1, name: "Unison", ratio: [1, 1], category: "basic" },
  { id: 2, harmonic: 2, name: "Octave", ratio: [2, 1], category: "basic" },
  { id: 3, harmonic: 3, name: "Perfect fifth", ratio: [3, 2], category: "basic" },
  { id: 4, harmonic: 4, name: "Perfect fourth", ratio: [4, 3], category: "basic" },
  { id: 5, harmonic: 5, name: "Major third", ratio: [5, 4], category: "basic" },
  { id: 6, harmonic: 6, name: "Minor third", ratio: [6, 5], category: "basic" },
  { id: 7, harmonic: 7, name: "Harmonic seventh", ratio: [7, 4], category: "basic" },
  { id: 8, harmonic: 8, name: "Major sixth", ratio: [5, 3], category: "basic" },
  { id: 9, harmonic: 9, name: "Minor sixth", ratio: [8, 5], category: "basic" },
  { id: 10, harmonic: 10, name: "Major tone", ratio: [9, 8], category: "basic" },
  { id: 11, harmonic: 11, name: "Minor tone", ratio: [10, 9], category: "basic" },
  { id: 12, harmonic: 12, name: "Diatonic semitone", ratio: [16, 15], category: "basic" },
  { id: 13, harmonic: 13, name: "Chromatic semitone", ratio: [25, 24], category: "basic" },
  { id: 14, harmonic: 14, name: "Augmented fourth", ratio: [45, 32], category: "basic" },
  { id: 15, harmonic: 15, name: "Diminished fifth", ratio: [64, 45], category: "basic" },
  { id: 16, harmonic: 16, name: "Major seventh", ratio: [15, 8], category: "basic" },
  { id: 17, harmonic: 17, name: "Minor seventh", ratio: [9, 5], category: "basic" }
];

// Simple composed intervals: "Octave + <interval>" for all basics except unison & octave.
const COMPOSED_INTERVALS: IntervalDef[] = JI_INTERVALS.filter(
  (int) => int.name !== "Unison" && int.name !== "Octave"
).map((base, idx) => {
  const [a, b] = base.ratio;
  const composedRatio: [number, number] = [a * 2, b]; // 2 * (a/b)
  return {
    id: 100 + idx + 1,
    harmonic: 0,
    name: `Octave + ${base.name}`,
    ratio: composedRatio,
    category: "composed",
    parentName: base.name
  };
});

export const ALL_INTERVALS: IntervalDef[] = [...JI_INTERVALS, ...COMPOSED_INTERVALS];

export function ratioToString([a, b]: [number, number]): string {
  return `${a}:${b}`;
}
