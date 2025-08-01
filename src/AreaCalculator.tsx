import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Calculator, Ruler } from 'lucide-react';
import { getAreaOfPolygon } from 'geolib';

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted: boolean;
  original: any;
}

interface AreaCalculatorProps {
  coordinates: Coordinate[];
}

const AreaCalculator: React.FC<AreaCalculatorProps> = ({ coordinates }) => {
  const calculateArea = () => {
    if (coordinates.length < 3) return null;

    try {
      // Convert coordinates to geolib v3 format
      const geoPoints = coordinates.map(coord => ({
        lat: coord.lat,
        lng: coord.lng
      }));

      // Calculate area in square meters using geolib v3
      const areaInSquareMeters = getAreaOfPolygon(geoPoints);
      
      return {
        squareMeters: areaInSquareMeters,
        squareFeet: areaInSquareMeters * 10.764,
        acres: areaInSquareMeters * 0.000247105,
        hectares: areaInSquareMeters * 0.0001,
        squareKilometers: areaInSquareMeters * 0.000001
      };
    } catch (error) {
      console.error('Error calculating area:', error);
      return null;
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatLargeNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const area = calculateArea();

  if (coordinates.length < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-600" />
            Area Calculator
          </CardTitle>
          <CardDescription>
            Upload at least 3 coordinates to calculate boundary area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Need {3 - coordinates.length} more point{3 - coordinates.length === 1 ? '' : 's'} to calculate area
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!area) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-red-600" />
            Area Calculator
          </CardTitle>
          <CardDescription>
            Error calculating area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Unable to calculate area for these coordinates
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-orange-600" />
          Boundary Area
        </CardTitle>
        <CardDescription>
          Calculated area of your property boundary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Primary measurements */}
          <div className="space-y-3">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {formatNumber(area.acres, 3)}
              </div>
              <div className="text-sm text-orange-600 font-medium">Acres</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {formatNumber(area.hectares, 3)}
              </div>
              <div className="text-sm text-blue-600 font-medium">Hectares</div>
            </div>
          </div>

          {/* Secondary measurements */}
          <div className="space-y-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-700">
                {formatLargeNumber(area.squareFeet)}
              </div>
              <div className="text-xs text-gray-600">Square Feet</div>
            </div>
            
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-700">
                {formatLargeNumber(area.squareMeters)}
              </div>
              <div className="text-xs text-gray-600">Square Meters</div>
            </div>

            {area.squareKilometers > 0.01 && (
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-700">
                  {formatNumber(area.squareKilometers, 4)}
                </div>
                <div className="text-xs text-gray-600">Square Kilometers</div>
              </div>
            )}
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              <span>Perimeter points: {coordinates.length}</span>
            </div>
            <Badge variant="outline">
              Calculated area
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaCalculator;