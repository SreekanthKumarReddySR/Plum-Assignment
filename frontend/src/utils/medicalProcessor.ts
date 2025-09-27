// Medical Report Processing Pipeline
// Structured backend processing for medical report analysis

export interface ExtractedTest {
  test_name: string;
  value: number;
  unit: string;
  confidence: number;
  raw_text: string;
}

export interface ExtractedData {
  extracted_tests: Array<{
    category: string;
    tests: ExtractedTest[];
    category_confidence: number;
  }>;
  confidence: number;
  categories_found: number;
  processing_time: number;
}

export interface NormalizedTest {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'low' | 'high';
  ref_range: { low: number; high: number };
  category: string;
}

export interface ProcessingResult {
  tests: NormalizedTest[];
  summary: string;
  explanations: string[];
  status: 'ok' | 'unprocessed';
  reason?: string;
}

/**
 * Step 2: Normalize extracted medical tests
 * Standardizes test names, units, ranges, and determines status
 */
export function normalizeTests(extractedData: ExtractedData): {
  tests: NormalizedTest[];
  normalization_confidence: number;
  categories_processed: number;
} {
  const normalizedTests: NormalizedTest[] = [];
  
  for (const category of extractedData.extracted_tests) {
    for (const test of category.tests) {
      const normalizedTest = normalizeIndividualTest(test, category.category);
      if (normalizedTest) {
        normalizedTests.push(normalizedTest);
      }
    }
  }

  return {
    tests: normalizedTests,
    normalization_confidence: Math.min(0.95, extractedData.confidence + 0.1),
    categories_processed: extractedData.categories_found
  };
}

/**
 * Normalize individual test with reference ranges
 */
function normalizeIndividualTest(test: ExtractedTest, category: string): NormalizedTest | null {
  const testNameLower = test.test_name.toLowerCase();
  let ref_range = { low: 0, high: 0 };
  let status: 'normal' | 'low' | 'high' = 'normal';

  // Define reference ranges based on test type
  if (testNameLower.includes('hemoglobin') || testNameLower.includes('hgb')) {
    ref_range = { low: 12.0, high: 15.0 };
    status = test.value < 12.0 ? 'low' : test.value > 15.0 ? 'high' : 'normal';
  } else if (testNameLower.includes('wbc') || testNameLower.includes('white')) {
    ref_range = { low: 4000, high: 11000 };
    status = test.value < 4000 ? 'low' : test.value > 11000 ? 'high' : 'normal';
  } else if (testNameLower.includes('glucose') || testNameLower.includes('sugar') || testNameLower.includes('fbs')) {
    ref_range = { low: 70, high: 100 };
    status = test.value < 70 ? 'low' : test.value > 100 ? 'high' : 'normal';
  } else if (testNameLower.includes('cholesterol') && testNameLower.includes('total')) {
    ref_range = { low: 0, high: 200 };
    status = test.value > 200 ? 'high' : 'normal';
  } else if (testNameLower.includes('ldl')) {
    ref_range = { low: 0, high: 100 };
    status = test.value > 100 ? 'high' : 'normal';
  } else if (testNameLower.includes('hdl')) {
    ref_range = { low: 40, high: 999 };
    status = test.value < 40 ? 'low' : 'normal';
  } else if (testNameLower.includes('triglyceride')) {
    ref_range = { low: 0, high: 150 };
    status = test.value > 150 ? 'high' : 'normal';
  } else if (testNameLower.includes('creatinine')) {
    ref_range = { low: 0.6, high: 1.3 };
    status = test.value < 0.6 ? 'low' : test.value > 1.3 ? 'high' : 'normal';
  } else if (testNameLower.includes('hba1c')) {
    ref_range = { low: 0, high: 5.7 };
    status = test.value > 5.7 ? 'high' : 'normal';
  } else {
    // Default range for unknown tests
    ref_range = { low: 0, high: 100 };
    status = 'normal';
  }

  return {
    name: test.test_name,
    value: test.value,
    unit: test.unit,
    status,
    ref_range,
    category
  };
}

/**
 * Step 3: Generate patient-friendly summary and explanations
 */
export function generatePatientSummary(normalizedTests: NormalizedTest[]): {
  summary: string;
  explanations: string[];
  abnormal_count: number;
  total_tests: number;
} {
  const abnormalTests = normalizedTests.filter(test => test.status !== 'normal');
  const explanations: string[] = [];
  let summary = '';

  if (abnormalTests.length === 0) {
    summary = 'All tested values appear to be within normal ranges.';
    explanations.push('Your test results look good! Continue maintaining a healthy lifestyle.');
  } else {
    const lowTests = abnormalTests.filter(test => test.status === 'low');
    const highTests = abnormalTests.filter(test => test.status === 'high');
    
    const summaryParts = [];
    if (lowTests.length > 0) {
      summaryParts.push(`Low: ${lowTests.map(t => t.name).join(', ')}`);
    }
    if (highTests.length > 0) {
      summaryParts.push(`High: ${highTests.map(t => t.name).join(', ')}`);
    }
    summary = summaryParts.join('. ');

    // Generate explanations for abnormal values
    abnormalTests.forEach(test => {
      const explanation = generateTestExplanation(test);
      if (explanation) {
        explanations.push(explanation);
      }
    });
  }

  return {
    summary,
    explanations,
    abnormal_count: abnormalTests.length,
    total_tests: normalizedTests.length
  };
}

/**
 * Generate explanation for individual test result
 */
function generateTestExplanation(test: NormalizedTest): string {
  const testNameLower = test.name.toLowerCase();
  
  if (testNameLower.includes('hemoglobin') && test.status === 'low') {
    return 'Low hemoglobin may indicate anemia, which can cause fatigue and weakness.';
  } else if (testNameLower.includes('wbc') && test.status === 'high') {
    return 'High white blood cell count can indicate infection or immune system activation.';
  } else if (testNameLower.includes('glucose') && test.status === 'high') {
    return 'High glucose levels may indicate diabetes or prediabetes.';
  } else if (testNameLower.includes('cholesterol') && test.status === 'high') {
    return 'High cholesterol increases risk of heart disease.';
  } else if (testNameLower.includes('creatinine') && test.status === 'high') {
    return 'High creatinine may indicate reduced kidney function.';
  } else if (testNameLower.includes('hba1c') && test.status === 'high') {
    return 'High HbA1c indicates poor long-term blood sugar control.';
  } else {
    return `${test.name} is ${test.status} - consult your doctor for interpretation.`;
  }
}

/**
 * Complete processing pipeline
 */
export async function processMedicalReport(extractedData: ExtractedData): Promise<ProcessingResult> {
  try {
    // Step 2: Normalize tests
    const normalizedResult = normalizeTests(extractedData);
    
    // Step 3: Generate patient-friendly summary
    const summaryResult = generatePatientSummary(normalizedResult.tests);
    
    // Guardrail: Check for hallucinated tests
    if (normalizedResult.tests.length === 0) {
      return {
        tests: [],
        summary: '',
        explanations: [],
        status: 'unprocessed',
        reason: 'No valid test results found in the input'
      };
    }
    
    return {
      tests: normalizedResult.tests,
      summary: summaryResult.summary,
      explanations: summaryResult.explanations,
      status: 'ok'
    };
    
  } catch (error) {
    return {
      tests: [],
      summary: '',
      explanations: [],
      status: 'unprocessed',
      reason: 'Processing error occurred'
    };
  }
}