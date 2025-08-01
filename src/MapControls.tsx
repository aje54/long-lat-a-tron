import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Satellite, Map, Mountain, Navigation, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MapControlsProps {
  mapType: string;
  onMapTypeChange: (type: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  coordinateCount: number;
}

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  onMapTypeChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleFullscreen,
  coordinateCount
}) => {
  const mapTypes = [
    { id: 'hybrid', name: 'Satellite', icon: Satellite, description: 'Aerial view with labels' },
    { id: 'terrain', name: 'Terrain', icon: Mountain, description: 'Topographic view' },
    { id: 'roadmap', name: 'Street', icon: Map, description: 'Street map view' },
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardContent className="p-4">
        {/* Map Type Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Map View</h4>
            <Badge variant="outline" className="text-xs">
              {coordinateCount} points
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {mapTypes.map((type) => (
              <Button
                key={type.id}
                variant={mapType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => onMapTypeChange(type.id)}
                className="justify-start h-auto p-2"
              >
                <type.icon className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium text-xs">{type.name}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Map Controls */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Controls</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomIn}
              className="flex items-center justify-center"
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom In
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomOut}
              className="flex items-center justify-center"
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Zoom Out
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onResetView}
              className="flex items-center justify-center"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              className="flex items-center justify-center"
            >
              <Navigation className="h-4 w-4 mr-1" />
              Fullscreen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapControls;