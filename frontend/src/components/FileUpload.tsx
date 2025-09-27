import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, Image, AlertCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import Tesseract from 'tesseract.js';
import { extractMedicalTests } from '@/utils/medicalRegex';

interface FileUploadProps {
  onFileUpload: (file: File, content: string, type: 'text' | 'image') => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : 'text';
    
    if (fileType === 'text') {
      const text = await file.text();
      // Extract medical tests using regex patterns
      const extractedData = extractMedicalTests(text);
      onFileUpload(file, JSON.stringify(extractedData, null, 2), 'text');
    } else {
      // Perform OCR on image
      setOcrStatus('Performing OCR...');
      setOcrProgress(0);
      
      try {
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        });
        
        setOcrStatus('OCR Complete! Extracting medical data...');
        
        // Extract medical tests from OCR text
        const extractedData = extractMedicalTests(result.data.text);
        
        setOcrStatus('');
        setOcrProgress(0);
        
        onFileUpload(file, JSON.stringify(extractedData, null, 2), 'image');
      } catch (error) {
        console.error('OCR Error:', error);
        setOcrStatus('OCR failed. Please try again.');
        setOcrProgress(0);
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleTextInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    if (text.trim()) {
      // Extract medical tests using regex patterns
      const extractedData = extractMedicalTests(text);
      
      // Create a file-like object without extending the File interface
      const fileData = {
        name: 'manual-input.txt',
        type: 'text/plain',
        size: text.length,
        lastModified: Date.now(),
      } as File;
      onFileUpload(fileData, JSON.stringify(extractedData, null, 2), 'text');
    }
  };

  return (
    <Card className="p-8 shadow-card">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Medical Report</h2>
          <p className="text-muted-foreground">
            Upload an image or text file, or paste your medical report text below
          </p>
        </div>

        {/* File Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
            isDragActive || dragActive 
              ? "border-primary bg-primary-light/20 scale-105" 
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? "Drop your file here" : "Drag & drop your medical report"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports: Images (PNG, JPG), Text files, PDF
              </p>
            </div>
            <Button variant="outline" disabled={isProcessing}>
              <File className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          </div>
        </div>

        {/* Manual Text Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Or paste your medical report text:
          </label>
          <textarea
            className="w-full h-32 p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            placeholder="Paste your medical report text here (e.g., CBC: Hemoglobin 10.2 g/dL (Low), WBC 11,200 /uL (High))"
            onChange={handleTextInput}
            disabled={isProcessing}
          />
        </div>

        {/* OCR Progress */}
        {ocrStatus && (
          <div className="space-y-3">
            <div className="flex items-center justify-center p-4 bg-primary-light/20 rounded-lg">
              <Eye className="h-6 w-6 text-primary mr-3" />
              <span className="text-primary font-medium">{ocrStatus}</span>
            </div>
            {ocrProgress > 0 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {isProcessing && !ocrStatus && (
          <div className="flex items-center justify-center p-4 bg-primary-light/20 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
            <span className="text-primary font-medium">Processing your report...</span>
          </div>
        )}
      </div>
    </Card>
  );
}