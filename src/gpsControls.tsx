import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { 
  Satellite, 
  Navigation, 
  MapPin, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Play,
  Square
} from 'lucide-react';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted: boolean;
  original: any;
}

interface GPSControlsProps {
  userLocation: UserLocation | null;
  isTracking: boolean;
  trackingError: string;
  nearbyPoint: Coordinate | null;
  isPlotMode: boolean;
  plotProgress: number;
  plottedCount: number;
  totalCount: number;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onTogglePlotMode: () => void;
  onMarkPointPlotted: (pointId: number) => void;
  onResetProgress: () => void;
}

const GPSControls: React.FC<GPSControlsProps> = ({
  userLocation,
  isTracking,
  trackingError,
  nearbyPoint,
  isPlotMode,
  plotProgress,
  plottedCount,
  totalCount,
  onStartTracking,
  onStopTracking,
  onTogglePlotMode,
  onMarkPointPlotted,
  onResetProgress,
}) => {
  return (
    <Card className={isPlotMode ? "border-orange-200 bg-orange-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="h-5 w-5 text-blue-600" />
          GPS Tracking & Plot Mode
        </CardTitle>
        <CardDescription>
          Navigate to boundary points and mark them as plotted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* GPS Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTracking ? (
              <Badge variant="default" className="bg-green-600">
                <Navigation className="h-3 w-3 mr-1" />
                GPS Active
              </Badge>
            ) : (
              <Badge variant="outline">
                <Navigation className="h-3 w-3 mr-1" />
                GPS Inactive
              </Badge>
            )}
            
            {isPlotMode && (
              <Badge variant="default" className="bg-orange-600">
                <Target className="h-3 w-3 mr-1" />
                Plot Mode
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isTracking ? "destructive" : "default"}
              onClick={isTracking ? onStopTracking : onStartTracking}
            >
              {isTracking ? (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Stop GPS
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start GPS
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant={isPlotMode ? "outline" : "default"}
              onClick={onTogglePlotMode}
              className={isPlotMode ? "bg-orange-100" : ""}
            >
              <Target className="h-4 w-4 mr-1" />
              {isPlotMode ? "Exit Plot" : "Plot Mode"}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {trackingError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{trackingError}</AlertDescription>
          </Alert>
        )}

        {/* Current Location */}
        {userLocation && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Your Location</p>
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

        {/* Nearby Point Alert */}
        {nearbyPoint && (
          <Alert className="border-orange-200 bg-orange-50">
            <MapPin className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Near Point {nearbyPoint.id + 1}!</strong>
                <br />
                <span className="text-xs">You're within 10 meters</span>
              </div>
              {isPlotMode && !nearbyPoint.plotted && (
                <Button
                  size="sm"
                  onClick={() => onMarkPointPlotted(nearbyPoint.id)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Plotted
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Plot Progress */}
        {isPlotMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Plot Progress</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {plottedCount} / {totalCount}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onResetProgress}
                  className="text-xs h-6"
                >
                  Reset
                </Button>
              </div>
            </div>
            <Progress value={plotProgress} className="h-2" />
            <p className="text-xs text-gray-600 text-center">
              {plotProgress.toFixed(0)}% Complete
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default GPSControls;