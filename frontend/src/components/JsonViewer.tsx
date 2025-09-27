import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JsonViewerProps {
  data: any;
  title: string;
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast({
      title: "Copied!",
      description: "JSON data copied to clipboard"
    });
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "JSON file has been downloaded"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'destructive';
      case 'high': return 'warning';
      case 'normal': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
            <Button variant="outline" size="sm" onClick={downloadJson}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        {data.extracted_tests && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.categories_found?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{data.extraction_details?.successful_extractions || 0}</div>
              <div className="text-sm text-muted-foreground">Tests Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{Math.round((data.overall_confidence || 0) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Overall Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{data.extraction_details?.total_patterns_tried || 0}</div>
              <div className="text-sm text-muted-foreground">Patterns Tried</div>
            </div>
          </div>
        )}

        {/* Categories Found */}
        {data.categories_found && data.categories_found.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Categories Detected:</h4>
            <div className="flex flex-wrap gap-2">
              {data.categories_found.map((category: string, index: number) => (
                <Badge key={index} variant="secondary">{category}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Tests by Category */}
        {data.extracted_tests && data.extracted_tests.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Extracted Tests:</h4>
            {data.extracted_tests.map((category: any, categoryIndex: number) => (
              <div key={categoryIndex} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-foreground">{category.category}</h5>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.tests.length} tests</Badge>
                    {category.category_confidence && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(category.category_confidence * 100)}% avg confidence
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {category.tests.map((test: any, testIndex: number) => (
                    <div key={testIndex} className="border border-border/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="font-semibold text-foreground">{test.test_name}</div>
                          <div className="text-sm text-muted-foreground">{test.raw_match}</div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-bold text-lg">
                            {test.value} {test.unit}
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            {test.status && (
                              <Badge variant={getStatusColor(test.status)} className="text-xs">
                                {test.status.toUpperCase()}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(test.confidence * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {test.reference_range && (
                        <div className="bg-muted/30 p-2 rounded text-sm">
                          <strong>Normal Range:</strong> {test.reference_range.low} - {test.reference_range.high} {test.unit}
                        </div>
                      )}
                      
                      {test.interpretation && (
                        <div className={`p-3 rounded text-sm ${
                          test.status === 'high' ? 'bg-warning/20 text-warning-foreground' :
                          test.status === 'low' ? 'bg-destructive/20 text-destructive-foreground' :
                          'bg-muted/30 text-muted-foreground'
                        }`}>
                          <strong>Interpretation:</strong> {test.interpretation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Raw JSON View */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Raw JSON Data:</h4>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 text-foreground">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </Card>
  );
}