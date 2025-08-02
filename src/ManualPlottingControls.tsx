import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Input } from './components/ui/input';
import { 
  Navigation, 
  Download, 
  Trash2, 
  Undo,
  MapPin,
  Target,
  Square,
  Play
} from 'lucide-react';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted: boolean;
  original: any;
}

interface ManualPlottingControlsProps {
  isManualMode: boolean;
  isRecording: boolean;
  manualCoordinates: Coordinate[];
  userLocation: UserLocation | null;
  isTracking: boolean;
  onStartManualMode: () => void;
  onCompleteManualMode: () => void;
  onPlotCurrentLocation: () => void;
  onClearCoordinates: () => void;
  onRemoveLastCoordinate: () => void;
  onExportToJSON: (filename: string) => void;
}

const ManualPlottingControls: React.FC<ManualPlottingControlsProps> = ({
  isManualMode,
  isRecording,
  manualCoordinates,
  userLocation,
  isTracking,
  onStartManualMode,
  onCompleteManualMode,
  onPlotCurrentLocation,
  onClearCoordinates,
  onRemoveLastCoordinate,
  onExportToJSON,
}) => {
  const [exportFilename, setExportFilename] = useState('my-boundary');

  const handleExport = () => {
    onExportToJSON(exportFilename || 'boundary-coordinates');
  };

  return (
    <Card className={isManualMode ? "border-purple-200 bg-purple-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-purple-600" />
          GPS-Based Coordinate Plotting
        </CardTitle>
        <CardDescription>
          Walk to each boundary point and record your GPS location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isManualMode ? (
              <Badge variant="default" className="bg-purple-600">
                <Target className="h-3 w-3 mr-1" />
                Recording Mode
              </Badge>
            ) : (
              <Badge variant="outline">
                <Navigation className="h-3 w-3 mr-1" />
                Ready to Record
              </Badge>
            )}
            
            {!isTracking && (
              <Badge variant="destructive" className="text-xs">
                GPS Required
              </Badge>
            )}
            
            {manualCoordinates.length > 0 && (
              <Badge variant="secondary">
                {manualCoordinates.length} points recorded
              </Badge>
            )}
          </div>
        </div>

        {/* GPS Location Display */}
        {userLocation && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Current GPS Location</p>
                <p className="text-xs text-blue-600 font-mono">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                ±{userLocation.accuracy.toFixed(0)}m
              </Badge>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isManualMode ? (
            <Button
              onClick={onStartManualMode}
              disabled={!isTracking}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button
                onClick={onPlotCurrentLocation}
                disabled={!userLocation}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Plot Point {manualCoordinates.length + 1}
              </Button>
              <Button
                onClick={onCompleteManualMode}
                variant="outline"
                className="bg-green-50 border-green-200 hover:bg-green-100"
              >
                <Square className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </>
          )}
        </div>

        {/* GPS Requirements */}
        {!isTracking && (
          <Alert className="border-red-200 bg-red-50">
            <Navigation className="h-4 w-4" />
            <AlertDescription>
              <strong>GPS tracking required.</strong> Please start GPS tracking first to record your location.
            </AlertDescription>
          </Alert>
        )}

        {/* Recording Instructions */}
        {isManualMode && (
          <Alert className="border-purple-200 bg-purple-50">
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Walk to each boundary corner</strong> and click "Plot Point" to record your GPS location. 
              Click "Complete" when you've recorded all boundary points.
            </AlertDescription>
          </Alert>
        )}

        {/* Recorded Points List */}
        {manualCoordinates.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Recorded Points</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onRemoveLastCoordinate}
                  className="text-xs"
                >
                  <Undo className="h-3 w-3 mr-1" />
                  Undo Last
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onClearCoordinates}
                  className="text-xs text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {manualCoordinates.map((coord, index) => (
                <div key={coord.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-700">
                      {index + 1}
                    </div>
                    <div>
                      <span className="text-sm font-medium">Point {index + 1}</span>
                      {coord.original.accuracy && (
                        <p className="text-xs text-gray-500">±{coord.original.accuracy.toFixed(0)}m</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-mono">
                    {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Section */}
        {manualCoordinates.length > 0 && !isManualMode && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Input
                placeholder="filename (without .json)"
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button
                size="sm"
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Export JSON
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              📁 Downloads as: {exportFilename || 'boundary-coordinates'}.json ({manualCoordinates.length} points)
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default ManualPlottingControls;