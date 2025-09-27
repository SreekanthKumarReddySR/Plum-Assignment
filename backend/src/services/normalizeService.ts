// Normalizes extracted medical test strings to structured objects

type RefRange = { low: number; high: number };

const TEST_RANGES: Record<string, RefRange> = {
  Hemoglobin: { low: 12.0, high: 15.0 },
  WBC: { low: 4000, high: 11000 }
};

export function normalizeTests(tests_raw: string[]) {
  const tests = [];

  for (const raw of tests_raw) {
    // Example: "Hemoglobin 10.2 g/dL (Low)"
    const match = raw.match(/([A-Za-z ]+)\s([\d.]+)\s([^\s]+)\s?\((Low|High|Normal)\)/i);
    if (match) {
      const name = match[1].trim();
      const value = parseFloat(match[2]);
      const unit = match[3];
      const status = match[4].toLowerCase();
      const ref_range = TEST_RANGES[name] || null;

      tests.push({
        name,
        value,
        unit,
        status,
        ref_range
      });
    }
  }

  return {
    tests,
    normalization_confidence: tests.length ? 0.84 : 0.0
  };
}

export function normalizeNumbers(tokens: string[]) {
  const corrected = tokens.map(t =>
    parseInt(t.replace(/[^\d]/g, ""), 10)
  ).filter(n => !isNaN(n));

  return {
    normalized_amounts: corrected,
    normalization_confidence: 0.82
  };
}
