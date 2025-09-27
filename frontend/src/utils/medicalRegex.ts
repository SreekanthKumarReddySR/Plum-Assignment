// Comprehensive regex patterns for medical test extraction with confidence scoring
export interface TestPattern {
  category: string;
  patterns: RegExp[];
  synonyms: string[];
  referenceRanges: { [key: string]: { low: number; high: number; unit: string; interpretation: { low: string; high: string } } };
}

export interface ExtractedTest {
  test_name: string;
  value: number;
  unit: string;
  raw_match: string;
  pattern_used: string;
  confidence: number;
  status?: 'low' | 'normal' | 'high';
  reference_range?: { low: number; high: number };
  interpretation?: string;
}

export const MEDICAL_TEST_PATTERNS: TestPattern[] = [
  // Blood Sugar Tests (Primary focus for diabetes patients)
  {
    category: "Blood Sugar",
    patterns: [
      /(?:fasting\s*blood\s*sugar|fbs|fasting\s*glucose|fpg|fasting\s*plasma\s*glucose)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|mmol\/l)?/gi,
      /(?:postprandial\s*blood\s*sugar|ppbs|post\s*meal\s*glucose|2hr\s*glucose|pp\s*glucose)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|mmol\/l)?/gi,
      /(?:random\s*blood\s*sugar|rbs|random\s*glucose|rpg|casual\s*glucose)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|mmol\/l)?/gi,
      /(?:hba1c|glycated\s*hemoglobin|glycohemoglobin|a1c|hemoglobin\s*a1c)\s*:?\s*([0-9]+\.?[0-9]*)\s*(%|percent|mmol\/mol)?/gi,
    ],
    synonyms: ["Blood Sugar", "Glucose Tests", "Diabetes Panel", "Glycemic Control"],
    referenceRanges: {
      "fasting blood sugar": { low: 70, high: 100, unit: "mg/dl", interpretation: { low: "May indicate hypoglycemia, dizziness, or weakness.", high: "Suggests diabetes or poor sugar control." } },
      "fbs": { low: 70, high: 100, unit: "mg/dl", interpretation: { low: "May indicate hypoglycemia, dizziness, or weakness.", high: "Suggests diabetes or poor sugar control." } },
      "postprandial blood sugar": { low: 0, high: 140, unit: "mg/dl", interpretation: { low: "Uncommon but may indicate excess insulin dose.", high: "Suggests diabetes or uncontrolled sugar after meals." } },
      "ppbs": { low: 0, high: 140, unit: "mg/dl", interpretation: { low: "Uncommon but may indicate excess insulin dose.", high: "Suggests diabetes or uncontrolled sugar after meals." } },
      "random blood sugar": { low: 0, high: 140, unit: "mg/dl", interpretation: { low: "May indicate hypoglycemia if very low.", high: "Possible diabetes if consistently high." } },
      "rbs": { low: 0, high: 140, unit: "mg/dl", interpretation: { low: "May indicate hypoglycemia if very low.", high: "Possible diabetes if consistently high." } },
      "hba1c": { low: 0, high: 5.7, unit: "%", interpretation: { low: "Unusual, but may reflect anemia or recent blood loss.", high: "Indicates diabetes or poor long-term sugar control." } }
    }
  },

  // Kidney Function Tests (Critical for diabetes complications)
  {
    category: "Kidney Function",
    patterns: [
      /(?:serum\s*creatinine|creatinine|creat|cr|s\.creat)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|μmol\/l|umol\/l)?/gi,
      /(?:blood\s*urea\s*nitrogen|bun|urea\s*nitrogen|blood\s*urea)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|mmol\/l)?/gi,
      /(?:urine\s*albumin\s*creatinine\s*ratio|acr|albumin\s*creatinine\s*ratio|microalbumin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/g|mg\/mmol)?/gi,
    ],
    synonyms: ["Kidney Function", "Renal Panel", "Nephropathy Screening"],
    referenceRanges: {
      "serum creatinine": { low: 0.6, high: 1.3, unit: "mg/dl", interpretation: { low: "Usually not concerning unless very low (muscle loss).", high: "May indicate kidney damage or reduced kidney function." } },
      "creatinine": { low: 0.6, high: 1.3, unit: "mg/dl", interpretation: { low: "Usually not concerning unless very low (muscle loss).", high: "May indicate kidney damage or reduced kidney function." } },
      "blood urea nitrogen": { low: 7, high: 20, unit: "mg/dl", interpretation: { low: "Possible liver disease or malnutrition.", high: "May indicate kidney problems or dehydration." } },
      "bun": { low: 7, high: 20, unit: "mg/dl", interpretation: { low: "Possible liver disease or malnutrition.", high: "May indicate kidney problems or dehydration." } },
      "urine albumin creatinine ratio": { low: 0, high: 30, unit: "mg/g", interpretation: { low: "Normal finding.", high: "Suggests early kidney damage (diabetic nephropathy)." } },
      "acr": { low: 0, high: 30, unit: "mg/g", interpretation: { low: "Normal finding.", high: "Suggests early kidney damage (diabetic nephropathy)." } }
    }
  },

  // Lipid Profile (Important for cardiovascular risk in diabetes)
  {
    category: "Lipid Profile",
    patterns: [
      /(?:total\s*cholesterol|cholesterol\s*total|t\.?\s*chol|tc|total\s*chol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|mmol\/l)?/gi,
      /(?:ldl\s*cholesterol|ldl|low\s*density\s*lipoprotein|bad\s*cholesterol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|mmol\/l)?/gi,
      /(?:hdl\s*cholesterol|hdl|high\s*density\s*lipoprotein|good\s*cholesterol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|mmol\/l)?/gi,
      /(?:triglyceride|tg|trig|triglycerides|trigs)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|mmol\/l)?/gi,
    ],
    synonyms: ["Lipid Profile", "Cholesterol Panel", "Cardiovascular Risk"],
    referenceRanges: {
      "total cholesterol": { low: 0, high: 200, unit: "mg/dl", interpretation: { low: "Uncommon, but may suggest malnutrition.", high: "Increases risk of heart disease." } },
      "ldl cholesterol": { low: 0, high: 100, unit: "mg/dl", interpretation: { low: "Generally good for health.", high: "Major risk factor for heart disease." } },
      "ldl": { low: 0, high: 100, unit: "mg/dl", interpretation: { low: "Generally good for health.", high: "Major risk factor for heart disease." } },
      "hdl cholesterol": { low: 40, high: 999, unit: "mg/dl", interpretation: { low: "Increases risk of heart disease.", high: "Protective for heart health." } },
      "hdl": { low: 40, high: 999, unit: "mg/dl", interpretation: { low: "Increases risk of heart disease.", high: "Protective for heart health." } },
      "triglycerides": { low: 0, high: 150, unit: "mg/dl", interpretation: { low: "Usually not a concern unless very low.", high: "Increases risk of heart disease and pancreatitis." } },
      "triglyceride": { low: 0, high: 150, unit: "mg/dl", interpretation: { low: "Usually not a concern unless very low.", high: "Increases risk of heart disease and pancreatitis." } }
    }
  },

  // Liver Function Tests
  {
    category: "Liver Function",
    patterns: [
      /(?:sgpt|alt|alanine\s*aminotransferase|alat|gpt)\s*:?\s*([0-9]+\.?[0-9]*)\s*(u\/l|iu\/l|units\/l)?/gi,
      /(?:sgot|ast|aspartate\s*aminotransferase|asat|got)\s*:?\s*([0-9]+\.?[0-9]*)\s*(u\/l|iu\/l|units\/l)?/gi,
      /(?:total\s*bilirubin|bilirubin\s*total|t\.?\s*bil|tbil|bilirubin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(mg\/dl|μmol\/l|umol\/l)?/gi,
    ],
    synonyms: ["Liver Function", "Hepatic Panel", "LFT"],
    referenceRanges: {
      "sgpt": { low: 7, high: 56, unit: "u/l", interpretation: { low: "Rarely significant.", high: "May indicate liver injury or fatty liver." } },
      "alt": { low: 7, high: 56, unit: "u/l", interpretation: { low: "Rarely significant.", high: "May indicate liver injury or fatty liver." } },
      "sgot": { low: 8, high: 45, unit: "u/l", interpretation: { low: "Not clinically significant.", high: "Suggests liver or muscle damage." } },
      "ast": { low: 8, high: 45, unit: "u/l", interpretation: { low: "Not clinically significant.", high: "Suggests liver or muscle damage." } },
      "total bilirubin": { low: 0.1, high: 1.2, unit: "mg/dl", interpretation: { low: "Not usually a concern.", high: "Suggests jaundice, liver, or bile duct issues." } },
      "bilirubin": { low: 0.1, high: 1.2, unit: "mg/dl", interpretation: { low: "Not usually a concern.", high: "Suggests jaundice, liver, or bile duct issues." } }
    }
  },

  // Complete Blood Count (CBC)
  {
    category: "Complete Blood Count",
    patterns: [
      /(?:hemoglobin|hgb|hb|haemoglobin|hemo)\s*:?\s*([0-9]+\.?[0-9]*)\s*(g\/dl|g\/l|gm\/dl)?/gi,
      /(?:white\s*blood\s*cell|wbc|white\s*cell|leucocyte|leukocyte|w\.b\.c)\s*:?\s*([0-9,]+\.?[0-9]*)\s*(\/ul|\/μl|\/ml|cells\/ul|per\s*ul)?/gi,
      /(?:platelet|plt|platelets|thrombocyte|platelet\s*count)\s*:?\s*([0-9,]+\.?[0-9]*)\s*(\/ul|\/μl|k\/ul|lakhs\/ul)?/gi,
    ],
    synonyms: ["CBC", "Complete Blood Count", "Blood Count", "Hemogram"],
    referenceRanges: {
      "hemoglobin": { low: 12, high: 15, unit: "g/dl", interpretation: { low: "Indicates anemia (tiredness, weakness).", high: "May indicate dehydration or polycythemia." } },
      "white blood cell": { low: 4000, high: 11000, unit: "/ul", interpretation: { low: "Risk of infection (low immunity).", high: "Suggests infection or inflammation." } },
      "wbc": { low: 4000, high: 11000, unit: "/ul", interpretation: { low: "Risk of infection (low immunity).", high: "Suggests infection or inflammation." } },
      "platelets": { low: 150000, high: 450000, unit: "/ul", interpretation: { low: "Risk of bleeding (low clotting ability).", high: "Risk of clotting or bone marrow issues." } },
      "platelet": { low: 150000, high: 450000, unit: "/ul", interpretation: { low: "Risk of bleeding (low clotting ability).", high: "Risk of clotting or bone marrow issues." } }
    }
  },

  // Electrolytes
  {
    category: "Electrolytes",
    patterns: [
      /(?:sodium|na\+?|na|serum\s*sodium)\s*:?\s*([0-9]+\.?[0-9]*)\s*(meq\/l|mmol\/l|mEq\/L)?/gi,
      /(?:potassium|k\+?|k|serum\s*potassium)\s*:?\s*([0-9]+\.?[0-9]*)\s*(meq\/l|mmol\/l|mEq\/L)?/gi,
    ],
    synonyms: ["Electrolytes", "Serum Electrolytes", "Basic Metabolic Panel"],
    referenceRanges: {
      "sodium": { low: 135, high: 145, unit: "mmol/l", interpretation: { low: "May cause confusion, weakness, or seizures (hyponatremia).", high: "May cause dehydration or high blood pressure (hypernatremia)." } },
      "potassium": { low: 3.5, high: 5.0, unit: "mmol/l", interpretation: { low: "May cause muscle weakness or heart rhythm issues.", high: "Can cause dangerous heart rhythm disturbances." } }
    }
  }
];

// Enhanced confidence scoring algorithm
function calculateConfidence(match: RegExpMatchArray, testName: string, value: number, unit: string): number {
  let confidence = 0.5; // Base confidence
  
  // Pattern quality scoring
  if (match[0].includes(':')) confidence += 0.2; // Structured format
  if (unit && unit.trim()) confidence += 0.15; // Has unit
  if (match[0].match(/^\s*\w+/)) confidence += 0.1; // Starts with word
  
  // Value validation
  if (value > 0 && value < 10000) confidence += 0.1; // Reasonable range
  if (value.toString().includes('.')) confidence += 0.05; // Decimal precision
  
  // Test name clarity
  const cleanTestName = testName.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanTestName.length > 2) confidence += 0.1;
  if (cleanTestName.match(/(glucose|sugar|cholesterol|creatinine|hemoglobin)/)) confidence += 0.1;
  
  // Tabular format detection (common units suggest structured data)
  if (unit && ['mg/dl', 'g/dl', 'mmol/l', '%', '/ul'].includes(unit.toLowerCase())) {
    confidence += 0.15;
  }
  
  return Math.min(confidence, 1.0);
}

// Enhanced status determination
function determineStatus(testName: string, value: number, unit: string, referenceRanges: any): { status: string; reference_range?: { low: number; high: number }; interpretation?: string } {
  const normalizedTestName = testName.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const normalizedUnit = unit.toLowerCase().replace(/[\/\s]/g, '');
  
  // Find matching reference range
  for (const [key, range] of Object.entries(referenceRanges)) {
    if (normalizedTestName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedTestName)) {
      const refRange = range as any;
      let status = 'normal';
      let interpretation = '';
      
      if (value < refRange.low) {
        status = 'low';
        interpretation = refRange.interpretation.low;
      } else if (value > refRange.high) {
        status = 'high';
        interpretation = refRange.interpretation.high;
      }
      
      return {
        status,
        reference_range: { low: refRange.low, high: refRange.high },
        interpretation
      };
    }
  }
  
  return { status: 'unknown' };
}

// Enhanced extraction function with tabular format handling
export function extractMedicalTests(text: string): any {
  const results: any = {
    extracted_tests: [],
    overall_confidence: 0,
    categories_found: [],
    raw_text: text,
    extraction_details: {
      total_patterns_tried: 0,
      total_matches_found: 0,
      successful_extractions: 0,
      confidence_scores: []
    }
  };

  let totalMatches = 0;
  let successfulExtractions = 0;
  let confidenceScores: number[] = [];

  // Pre-process text for tabular format detection
  const lines = text.split('\n');
  let processedText = text;
  
  // Detect if first line contains only units (tabular format)
  const firstLine = lines[0]?.trim();
  if (firstLine && firstLine.match(/^(mg\/dl|g\/dl|mmol\/l|%|\/ul|u\/l)+$/i)) {
    // Handle tabular format by associating units with values
    processedText = lines.slice(1).map(line => {
      if (line.match(/^\s*[a-zA-Z]/)) {
        return line + ' ' + firstLine;
      }
      return line;
    }).join('\n');
  }

  MEDICAL_TEST_PATTERNS.forEach(testPattern => {
    const categoryResults: ExtractedTest[] = [];
    results.extraction_details.total_patterns_tried++;
    
    testPattern.patterns.forEach(pattern => {
      const matches = processedText.matchAll(pattern);
      for (const match of matches) {
        totalMatches++;
        
        if (match[1]) { // If we captured a value
          successfulExtractions++;
          
          const rawTestName = match[0].split(':')[0].trim();
          const testName = rawTestName.replace(/^[^\w]*/, '').trim();
          const value = parseFloat(match[1].replace(/,/g, ''));
          const unit = (match[2] || '').toLowerCase().trim();
          
          const confidence = calculateConfidence(match, testName, value, unit);
          confidenceScores.push(confidence);
          
          const statusInfo = determineStatus(testName, value, unit, testPattern.referenceRanges);
          
          const extractedTest: ExtractedTest = {
            test_name: testName,
            value: value,
            unit: unit,
            raw_match: match[0],
            pattern_used: pattern.source,
            confidence: confidence,
            status: statusInfo.status as any,
            reference_range: statusInfo.reference_range,
            interpretation: statusInfo.interpretation
          };
          
          categoryResults.push(extractedTest);
        }
      }
    });

    if (categoryResults.length > 0) {
      results.categories_found.push(testPattern.category);
      results.extracted_tests.push({
        category: testPattern.category,
        synonyms: testPattern.synonyms,
        tests: categoryResults,
        category_confidence: categoryResults.reduce((sum, test) => sum + test.confidence, 0) / categoryResults.length
      });
    }
  });

  // Calculate overall confidence
  results.overall_confidence = confidenceScores.length > 0 
    ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
    : 0;
    
  results.extraction_details.total_matches_found = totalMatches;
  results.extraction_details.successful_extractions = successfulExtractions;
  results.extraction_details.confidence_scores = confidenceScores;

  return results;
}