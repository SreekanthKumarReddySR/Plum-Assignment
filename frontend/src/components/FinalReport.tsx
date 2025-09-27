import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface FinalReportProps {
  data: {
    tests: Array<{
      name: string;
      value: number;
      unit: string;
      status: 'normal' | 'low' | 'high';
      ref_range: { low: number; high: number };
    }>;
    summary: string;
    explanations?: string[];
    status: 'ok' | 'unprocessed';
    reason?: string;
  };
  onDownload: () => void;
  onShare: () => void;
}

export function FinalReport({ data, onDownload, onShare }: FinalReportProps) {
  if (data.status === 'unprocessed') {
    return (
      <Card className="p-8 shadow-card border-destructive/20">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Processing Failed</h3>
            <p className="text-muted-foreground">
              {data.reason || 'Unable to process the medical report'}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-card">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-success/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Medical Report Analysis</h2>
              <p className="text-muted-foreground">Complete and ready for review</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="medical" onClick={onShare}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-subtle rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            Summary
          </h3>
          <p className="text-foreground leading-relaxed">{data.summary}</p>
        </div>

        {/* Test Results */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Test Results</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {data.tests.map((test, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground text-lg">{test.name}</h4>
                  <Badge 
                    variant={test.status === 'normal' ? 'secondary' : 
                            test.status === 'low' ? 'warning' : 'destructive'}
                    className="text-xs"
                  >
                    {test.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {test.value}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {test.unit}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Reference Range: {test.ref_range.low} - {test.ref_range.high} {test.unit}
                  </div>
                  
                  {/* Visual indicator */}
                  <div className="w-full bg-muted rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        test.status === 'normal' ? 'bg-success' :
                        test.status === 'low' ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(10, 
                          ((test.value - test.ref_range.low) / 
                           (test.ref_range.high - test.ref_range.low)) * 100
                        ))}%` 
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Explanations */}
        {data.explanations && data.explanations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">What This Means</h3>
            <div className="space-y-3">
              {data.explanations.map((explanation, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary-foreground">{index + 1}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Card>
  );
}