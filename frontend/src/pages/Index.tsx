import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ProcessingStep } from '@/components/ProcessingStep';
import { FinalReport } from '@/components/FinalReport';
import { JsonViewer } from '@/components/JsonViewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processMedicalReport } from '@/utils/medicalProcessor';
interface ProcessingState {
  step1: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any; confidence?: number };
  step2: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any; confidence?: number };
  step3: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any; confidence?: number };
}

const Index = () => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingState>({
    step1: { status: 'pending' },
    step2: { status: 'pending' },
    step3: { status: 'pending' }
  });
  const [finalReport, setFinalReport] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, content: string, type: 'text' | 'image') => {
    setCurrentFile(file);
    setIsProcessing(true);
    setFinalReport(null);
    
    // Reset all steps
    setProcessingSteps({
      step1: { status: 'pending' },
      step2: { status: 'pending' },
      step3: { status: 'pending' }
    });

    try {
      // Step 1: OCR/Text Extraction (already done in FileUpload component)
      setProcessingSteps(prev => ({
        ...prev,
        step1: { status: 'processing' }
      }));

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

      // Parse the extracted medical data from content
      const extractedData = JSON.parse(content);
      setExtractedData(extractedData);
      
      setProcessingSteps(prev => ({
        ...prev,
        step1: { status: 'completed', result: extractedData, confidence: extractedData.confidence }
      }));

      // Steps 2-3: Process using structured backend
      setProcessingSteps(prev => ({
        ...prev,
        step2: { status: 'processing' }
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      const report = await processMedicalReport(extractedData);

      setProcessingSteps(prev => ({
        ...prev,
        step2: { status: 'completed', confidence: 0.9 },
        step3: { status: 'completed', result: report }
      }));

      setFinalReport(report);
      
      toast({
        title: "Analysis Complete",
        description: "Your medical report has been successfully processed and simplified.",
        variant: "default"
      });

    } catch (error) {
      console.error('Processing error:', error);
      setProcessingSteps(prev => ({
        ...prev,
        step1: { status: 'error' },
        step2: { status: 'error' },
        step3: { status: 'error' }
      }));
      
      toast({
        title: "Processing Failed",
        description: "There was an error processing your medical report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!finalReport) return;
    
    const reportData = JSON.stringify(finalReport, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'medical-report-analysis.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Your medical report analysis has been downloaded."
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Feature",
      description: "Share functionality would be implemented with proper authentication and privacy controls."
    });
  };

  const resetAnalysis = () => {
    setCurrentFile(null);
    setProcessingSteps({
      step1: { status: 'pending' },
      step2: { status: 'pending' },
      step3: { status: 'pending' }
    });
    setFinalReport(null);
    setExtractedData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 px-4 border-b">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Medical Report Analyzer</h1>
          </div>
          <p className="text-muted-foreground">
            Upload medical reports and get structured analysis
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {!currentFile && !finalReport && (
            <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
          )}

          {/* Extracted Data Display */}
          {extractedData && (
            <div className="mb-8">
              <JsonViewer data={extractedData} title="Extracted Medical Data" />
            </div>
          )}

          {/* Processing Steps */}
          {currentFile && !finalReport && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Processing Your Report</h2>
                  <p className="text-muted-foreground mt-2">
                    Analyzing: {currentFile.name}
                  </p>
                </div>
                <Button variant="outline" onClick={resetAnalysis} disabled={isProcessing}>
                  Start Over
                </Button>
              </div>

              <ProcessingStep
                step={1}
                title="OCR & Text Extraction"
                description="Extracting test names, values, and units from your report"
                status={processingSteps.step1.status}
                result={processingSteps.step1.result}
                confidence={processingSteps.step1.confidence}
              />

              <ProcessingStep
                step={2}
                title="Test Normalization"
                description="Standardizing test names, units, ranges, and statuses"
                status={processingSteps.step2.status}
                result={processingSteps.step2.result}
                confidence={processingSteps.step2.confidence}
              />

              <ProcessingStep
                step={3}
                title="Patient-Friendly Translation"
                description="Creating easy-to-understand explanations of your results"
                status={processingSteps.step3.status}
                result={processingSteps.step3.result}
              />
            </div>
          )}

          {/* Final Report */}
          {finalReport && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Your Medical Report Analysis</h2>
                  <p className="text-muted-foreground mt-2">
                    Analysis complete for: {currentFile?.name}
                  </p>
                </div>
                <Button variant="outline" onClick={resetAnalysis}>
                  Analyze Another Report
                </Button>
              </div>

              <FinalReport 
                data={finalReport} 
                onDownload={handleDownload}
                onShare={handleShare}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;