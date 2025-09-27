export function classifyAmounts(amounts: number[], text: string) {
  const labels = ["total_bill", "paid", "due"];
  const result = amounts.map((val, idx) => ({
    type: labels[idx] || "unknown",
    value: val,
  }));

  return {
    amounts: result,
    confidence: 0.80
  };
}
