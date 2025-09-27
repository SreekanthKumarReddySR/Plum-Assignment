// Generates patient-friendly explanations for medical test results

export function explainTests(tests: any[]) {
  let summary = [];
  let explanations = [];

  for (const test of tests) {
    if (test.name === "Hemoglobin" && test.status === "low") {
      summary.push("Low hemoglobin");
      explanations.push("Low hemoglobin may relate to anemia.");
    }
    if (test.name === "WBC" && test.status === "high") {
      summary.push("High white blood cell count");
      explanations.push("High WBC can occur with infections.");
    }
    // Add more rules as needed
  }

  return {
    summary: summary.join(" and ") + (summary.length ? "." : ""),
    explanations
  };
}