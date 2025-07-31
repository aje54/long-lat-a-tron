import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted: boolean;
  original: any;
}

interface CoordinateListProps {
  coordinates: Coordinate[];
  selectedCoordinate: number | null;
  onCoordinateSelect: (id: number) => void;
  onCoordinateCenter: (id: number) => void;
}



const CoordinateList: React.FC<CoordinateListProps> = ({
  coordinates,
  selectedCoordinate,
  onCoordinateSelect,
  onCoordinateCenter
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Boundary Points
        </CardTitle>
        <CardDescription>
          Click any point to highlight it on the map
        </CardDescription>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {coordinates.length} points
          </Badge>
          <Badge variant="outline">
            {coordinates.filter(c => c.plotted).length} plotted
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {coordinates.map((coord, index) => (
            <div
              key={coord.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedCoordinate === coord.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              //onClick={() => onCoordinateSelect(coord.id)}
              // In CoordinateList.tsx, update the onClick handler:
              onClick={() => {
                console.log('Coordinate div clicked, id:', coord.id);
                onCoordinateSelect(coord.id);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    selectedCoordinate === coord.id
                      ? 'bg-blue-500 text-white'
                      : coord.plotted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">Point {index + 1}</div>
                    <div className="text-xs text-gray-600 font-mono">
                      {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {coord.plotted && (
                    <Badge variant="default" className="text-xs">
                      ✓ Plotted
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCoordinateCenter(coord.id);
                    }}
                    className="h-7 w-7 p-0"
                  >
                    <Navigation className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoordinateList;