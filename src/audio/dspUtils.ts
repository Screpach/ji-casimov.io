export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function centsToRatio(cents: number): number {
  return Math.pow(2, cents / 1200);
}

export function ratioToCents(ratio: number): number {
  return 1200 * Math.log2(ratio);
}

export function freqFromMidi(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(minInclusive: number, maxInclusive: number): number {
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(Math.random() * span);
}
