import Tesseract from "tesseract.js";

// Medical OCR/Text Extraction Service

/**
 * Extracts medical test information from text or OCR image.
 * Fixes minor typos and returns raw test strings.
 * @param filePath - Path to uploaded image (optional)
 * @param inputText - Direct text input (optional)
 */
export async function extractMedicalText(filePath?: string, inputText?: string) {
  // For demo: Use inputText if provided, else simulate OCR from image
  let text = inputText;
  let confidence = 0.80;

  if (!text && filePath) {
    // Simulate OCR extraction from image
    // In production, use Tesseract or similar OCR library
    text = "CBC: Hemglobin 10.2 g/dL (Low)\nWBC 11200 /uL (Hgh)";
    confidence = 0.75;
  }

  // Basic typo correction (demo)
  text = text
    ?.replace(/Hemglobin/i, "Hemoglobin")
    .replace(/Hgh/i, "High");

  // Extract test lines
  const lines = text?.split("\n").map(l => l.trim()).filter(l => l.length > 0) || [];
  const tests_raw: string[] = [];

  for (const line of lines) {
    // Match test pattern: Name Value Unit (Status)
    const match = line.match(/([A-Za-z ]+)\s([\d.]+)\s([^\s]+)\s?\((Low|High|Normal)\)/i);
    if (match) {
      tests_raw.push(`${match[1].trim()} ${match[2]} ${match[3]} (${match[4]})`);
    }
  }

  return {
    tests_raw,
    confidence
  };
}

/**
 * Extracts text from an image file using Tesseract OCR.
 * @param filePath - Path to the image file
 * @param text - Optional direct text input
 * @returns Extracted text and metadata
 */
export async function extractText(filePath?: string, text?: string) {
  let extracted = text || "";
  if (filePath) {
    const result = await Tesseract.recognize(filePath, "eng");
    extracted = result.data.text;
  }

  const tokens = extracted.match(/\d+%?|\d+\.\d+/g) || [];
  return {
    raw_tokens: tokens,
    currency_hint: extracted.includes("INR") || extracted.includes("Rs") ? "INR" : "UNKNOWN",
    confidence: 0.74
  };
}
