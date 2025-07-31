
import React, { useState } from 'react';
import { Upload, MapPin, AlertCircle, CheckCircle, X, FileText } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import MapComponent from './MapComponent';

const LandBoundaryPlotter = () => {
  const [coordinates, setCoordinates] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBeoZp5kOUEDDRT4IUmunZb4AJuXc4wXAY';

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        if (Array.isArray(jsonData)) {
          const validCoords = jsonData.map((coord, index) => {
            const lat = coord.lat || coord.latitude;
            const lng = coord.lng || coord.longitude || coord.long;
            
            if (typeof lat === 'number' && typeof lng === 'number') {
              return {
                id: index,
                lat: lat,
                lng: lng,
                plotted: false,
                original: coord
              };
            }
            throw new Error(`Invalid coordinate at index ${index}`);
          });
          
          setCoordinates(validCoords);
          setError('');
        } else {
          setError('JSON should contain an array of coordinate objects');
        }
      } catch (err) {
        setError(`Error parsing JSON: ${(err as Error).message}`);
        setCoordinates([]);
      }
    };

    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileUpload(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const clearData = () => {
    setCoordinates([]);
    setFileName('');
    setError('');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <MapPin className="h-6 w-6 text-green-600" />
              Long-Lat-A-Tron
            </CardTitle>
            <CardDescription>
              Step 1: Upload your coordinate file to get started
            </CardDescription>
          </CardHeader>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Coordinates
            </CardTitle>
            <CardDescription>
              Upload a JSON file containing your boundary coordinates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                
                <div>
                  <p className="text-lg font-medium">
                    Drop your JSON file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports .json files with lat/lng coordinates
                  </p>
                </div>

                <input
                  id="file-input"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button 
                  onClick={() => document.getElementById('file-input')?.click()}
                  variant="outline"
                  className="mt-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>

            {fileName && (
              <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Loaded: {fileName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearData}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Coordinates Preview */}
        {coordinates.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Coordinates Loaded
                </CardTitle>
                <Badge variant="secondary">
                  {coordinates.length} points
                </Badge>
              </div>
              <CardDescription>
                Your boundary points are ready for mapping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">
                    Successfully loaded {coordinates.length} coordinate points
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {coordinates.slice(0, 8).map((coord, index) => (
                    <div key={coord.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">Point {index + 1}</span>
                      </div>
                      <div className="text-sm text-gray-600 font-mono">
                        {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                      </div>
                    </div>
                  ))}
                  {coordinates.length > 8 && (
                    <div className="text-center py-2">
                      <Badge variant="outline">
                        +{coordinates.length - 8} more points
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map Display */}
        {coordinates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Boundary Map
              </CardTitle>
              <CardDescription>
                Your boundary points visualized on the map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full rounded-lg overflow-hidden border">
                <MapComponent 
                  coordinates={coordinates}
                  apiKey={GOOGLE_MAPS_API_KEY}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {coordinates.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">🎯 Coming Next</CardTitle>
              <CardDescription className="text-blue-700">
                Your coordinates are ready! Here's what we'll build next:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Google Maps integration
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Boundary visualization
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  GPS tracking mode
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Proximity notifications
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Format Help */}
        {coordinates.length === 0 && !error && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Expected JSON Format</CardTitle>
              <CardDescription>
                Your JSON file should contain an array of coordinate objects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm overflow-x-auto">
                </pre>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                💡 Supports both lat/lng and latitude/longitude field names
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default LandBoundaryPlotter;
