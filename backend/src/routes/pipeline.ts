import { Router } from "express";
import multer from "multer";
import { extractMedicalText } from "../services/ocrService";
import { normalizeTests } from "../services/normalizeService";
import { explainTests } from "../services/explanationService";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Step 1: OCR/Text Extraction

router.post("/medical/extract", upload.single("file"), async (req, res) => {
  const inputText = req.body.text;
  try {
    const result = await extractMedicalText(req.file?.path, inputText);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Step 2: Normalized Tests
router.post("/medical/normalize", (req, res) => {
  const { tests_raw } = req.body;
  try {
    const result = normalizeTests(tests_raw);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Step 3: Patient-Friendly Summary
router.post("/medical/explain", (req, res) => {
  const { tests } = req.body;
  try {
    const result = explainTests(tests);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Step 4: Full Medical Report Pipeline
router.post("/medical/process", upload.single("file"), async (req, res) => {
  try {
    const inputText = req.body.text;
    const extracted = await extractMedicalText(req.file?.path, inputText);

    if (!extracted.tests_raw || !extracted.tests_raw.length) {
      return res.json({ status: "unprocessed", reason: "no tests found in input" });
    }

    const normalized = normalizeTests(extracted.tests_raw);

    // Guardrail: Check for hallucinated tests
    if (!normalized.tests || normalized.tests.length === 0) {
      return res.json({ status: "unprocessed", reason: "hallucinated tests not present in input" });
    }

    const explanation = explainTests(normalized.tests);

    res.json({
      tests: normalized.tests,
      summary: explanation.summary,
      status: "ok"
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
