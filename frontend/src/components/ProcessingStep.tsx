import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, FileText, Brain, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStepProps {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  confidence?: number;
}

const stepIcons = {
  1: FileText,
  2: Brain,
  3: MessageSquare,
};

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted',
    badge: 'secondary' as const
  },
  processing: { 
    icon: Clock, 
    color: 'text-primary', 
    bgColor: 'bg-primary/10',
    badge: 'default' as const
  },
  completed: { 
    icon: CheckCircle, 
    color: 'text-success', 
    bgColor: 'bg-success/10',
    badge: 'secondary' as const
  },
  error: { 
    icon: AlertCircle, 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    badge: 'destructive' as const
  }
};

export function ProcessingStep({ step, title, description, status, result, confidence }: ProcessingStepProps) {
  const StepIcon = stepIcons[step as keyof typeof stepIcons];
  const StatusIcon = statusConfig[status].icon;
  const config = statusConfig[status];

  return (
    <Card className={cn(
      "p-6 transition-all duration-300",
      status === 'processing' && "shadow-glow border-primary/20",
      status === 'completed' && "shadow-card"
    )}>
      <div className="flex items-start space-x-4">
        {/* Step Icon */}
        <div className={cn(
          "p-3 rounded-full flex-shrink-0",
          config.bgColor
        )}>
          <StepIcon className={cn("h-6 w-6", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <Badge variant={config.badge}>
                  Step {step}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            
            {/* Status */}
            <div className="flex items-center space-x-2">
              <StatusIcon className={cn("h-5 w-5", config.color)} />
              {confidence && (
                <Badge variant="outline">
                  {Math.round(confidence * 100)}% confidence
                </Badge>
              )}
            </div>
          </div>

          {/* Processing Animation */}
          {status === 'processing' && (
            <div className="flex items-center space-x-2 text-primary">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Processing...</span>
            </div>
          )}

          {/* Results */}
          {result && status === 'completed' && (
            <div className="bg-muted/50 rounded-lg p-4 mt-3">
              {step === 1 && result.tests_raw && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Extracted Tests:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.tests_raw.map((test: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === 2 && result.tests && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Normalized Tests:</h4>
                  <div className="space-y-2">
                    {result.tests.map((test: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                        <div>
                          <span className="font-medium">{test.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {test.value} {test.unit}
                          </span>
                        </div>
                        <Badge 
                          variant={test.status === 'normal' ? 'secondary' : 
                                  test.status === 'low' ? 'warning' : 'destructive'}
                        >
                          {test.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && result.summary && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Patient-Friendly Summary:</h4>
                  <p className="text-sm text-muted-foreground mb-3">{result.summary}</p>
                  {result.explanations && (
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Detailed Explanations:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {result.explanations.map((explanation: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                            <span>{explanation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-3">
              <p className="text-sm text-destructive">
                An error occurred during processing. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}