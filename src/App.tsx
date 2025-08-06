import React from 'react';
import { Upload, MapPin, AlertCircle, CheckCircle, X, FileText, RotateCcw, Navigation } from 'lucide-react';
import { Satellite, Mountain } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import MapComponent from './MapComponent';
import CoordinateList from './CoordinateList';
import AreaCalculator from './AreaCalculator';
import GPSControls from './gpsControls';
import ManualPlottingControls from './ManualPlottingControls';
import { useFileUpload, Coordinate } from './hooks/useFileUpload';
import { useMapControls } from './hooks/useMapControls';
import { useCoordinateSelection } from './hooks/useCoordinateSelection';
import { useGPSTracking } from './hooks/useGPSTracking';
import { usePlotMode } from './hooks/usePlotMode';
import { useManualPlotting } from './hooks/useManualPlotting';

const LandBoundaryPlotter = () => {
  
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  console.log('🔑 API Key:', GOOGLE_MAPS_API_KEY ? 'LOADED' : 'EMPTY');

  // File upload hook
  const {
    coordinates,
    fileName,
    error,
    isDragging,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearData,
    setCoordinates,
  } = useFileUpload();

  // Manual plotting hook - FIRST so variables are available
  const {
    isManualMode,
    isRecording,
    manualCoordinates,
    addCurrentLocationAsCoordinate,
    removeLastCoordinate,
    clearManualCoordinates,
    startManualMode,
    completeManualMode,
    exportToJSON,
    setManualCoordinates,
  } = useManualPlotting();

  // Map controls hook
  const {
    mapType,
    handleMapTypeChange,
    handleResetView,
    handleMapReady,
  } = useMapControls();

  // Coordinate selection hook
  const {
    selectedCoordinate,
    centerCoordinate,
    handleCoordinateSelect,
    handleCoordinateCenter,
    handleMarkerClick,
  } = useCoordinateSelection();

  // Get the active coordinates (uploaded or manual)
  const activeCoordinates = coordinates.length > 0 ? coordinates : manualCoordinates;

  // GPS tracking hook - NOW activeCoordinates is defined
  const {
    userLocation,
    isTracking,
    trackingError,
    nearbyPoint,
    startTracking,
    stopTracking,
  } = useGPSTracking(activeCoordinates);

  // Plot mode hook - NOW all variables are defined
  const {
    isPlotMode,
    plotProgress,
    markPointAsPlotted,
    resetPlotProgress,
    togglePlotMode,
    getPlottedCount,
    getTotalCount,
  } = usePlotMode(activeCoordinates, coordinates.length > 0 ? setCoordinates : setManualCoordinates);

  // Handle plotting current GPS location
  const handlePlotCurrentLocation = () => {
    addCurrentLocationAsCoordinate(userLocation);
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
              V0.1
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
      Upload a JSON file containing your boundary coordinates or create them using GPS
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
            Upload your JSON coordinate file
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop, or choose from device storage
          </p>
        </div>

        {/* Multiple upload options */}
        <div className="flex flex-col gap-2">
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
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose from Device Storage
          </Button>
          
          <p className="text-xs text-gray-500">
            📁 This will access all files on your device (including Downloads, My Files, etc.)
          </p>
        </div>
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

        {/* Manual Plotting Controls */}
        <ManualPlottingControls
  isManualMode={isManualMode}
  isRecording={isRecording}
  manualCoordinates={manualCoordinates}
  userLocation={userLocation}
  isTracking={isTracking}
  onStartManualMode={startManualMode}
  onCompleteManualMode={completeManualMode}
  onPlotCurrentLocation={handlePlotCurrentLocation}
  onClearCoordinates={clearManualCoordinates}
  onRemoveLastCoordinate={removeLastCoordinate}
  onExportToJSON={exportToJSON}
  onStartGPSTracking={startTracking}
/>

        {/* Coordinates Preview */}
        {activeCoordinates.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {coordinates.length > 0 ? 'Uploaded' : 'GPS Recorded'} Coordinates
                </CardTitle>
                <Badge variant="secondary">
                  {activeCoordinates.length} points
                </Badge>
              </div>
              <CardDescription>
                Your boundary points are ready for mapping and field plotting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">
                    {coordinates.length > 0 ? 'Uploaded' : 'GPS recorded'} {activeCoordinates.length} coordinate points
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeCoordinates.slice(0, 8).map((coord: Coordinate, index: number) => (
                    <div key={coord.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          coord.plotted 
                            ? 'bg-green-100 text-green-700' 
                            : coord.original?.manually_created
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {coord.plotted ? '✓' : index + 1}
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            Point {index + 1} 
                            {coord.plotted && ' (Plotted)'}
                            {coord.original?.manually_created && ' (GPS)'}
                          </span>
                          {coord.original?.accuracy && (
                            <p className="text-xs text-gray-500">±{coord.original.accuracy.toFixed(0)}m</p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 font-mono">
                        {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                      </div>
                    </div>
                  ))}
                  {activeCoordinates.length > 8 && (
                    <div className="text-center py-2">
                      <Badge variant="outline">
                        +{activeCoordinates.length - 8} more points
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GPS Controls */}
        {activeCoordinates.length > 0 && (
          <GPSControls
            userLocation={userLocation}
            isTracking={isTracking}
            trackingError={trackingError}
            nearbyPoint={nearbyPoint}
            isPlotMode={isPlotMode}
            plotProgress={plotProgress}
            plottedCount={getPlottedCount()}
            totalCount={getTotalCount()}
            onStartTracking={startTracking}
            onStopTracking={stopTracking}
            onTogglePlotMode={togglePlotMode}
            onMarkPointPlotted={markPointAsPlotted}
            onResetProgress={resetPlotProgress}
          />
        )}

        {/* Split Layout: Coordinate List + Map */}
        {activeCoordinates.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coordinate List */}
            <CoordinateList
              coordinates={activeCoordinates}
              selectedCoordinate={selectedCoordinate}
              onCoordinateSelect={handleCoordinateSelect}
              onCoordinateCenter={handleCoordinateCenter}
            />
            
            {/* Map with Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Boundary Map
                  {isTracking && (
                    <Badge variant="default" className="bg-blue-600 text-xs">
                      GPS Active
                    </Badge>
                  )}
                  {isManualMode && (
                    <Badge variant="default" className="bg-purple-600 text-xs">
                      Recording
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Interactive map with GPS tracking and coordinate recording
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Map Type Controls */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant={mapType === 'hybrid' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMapTypeChange('hybrid')}
                        className="text-xs"
                      >
                        <Satellite className="h-3 w-3 mr-1" />
                        Satellite
                      </Button>
                      <Button
                        variant={mapType === 'terrain' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMapTypeChange('terrain')}
                        className="text-xs"
                      >
                        <Mountain className="h-3 w-3 mr-1" />
                        Terrain
                      </Button>
                      <Button
                        variant={mapType === 'roadmap' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMapTypeChange('roadmap')}
                        className="text-xs"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Street
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetView(activeCoordinates)}
                        className="text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset View
                      </Button>
                    </div>
                  </div>
                  
                  {/* Map */}
                  <div className="h-96 w-full rounded-lg overflow-hidden border">
                    <MapComponent 
                      coordinates={activeCoordinates}
                      apiKey={GOOGLE_MAPS_API_KEY}
                      selectedCoordinate={selectedCoordinate}
                      onMarkerClick={handleMarkerClick}
                      centerCoordinate={centerCoordinate}
                      mapType={mapType}
                      onMapReady={handleMapReady}
                      userLocation={userLocation}
                    />
                  </div>
                  
                  {/* Map Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {activeCoordinates.length} boundary points
                      </Badge>
                      {isPlotMode && (
                        <Badge variant="outline" className="text-xs bg-orange-100">
                          🎯 Plot Mode: {getPlottedCount()}/{getTotalCount()} complete
                        </Badge>
                      )}
                      {isManualMode && (
                        <Badge variant="outline" className="text-xs bg-purple-100">
                          📍 Recording GPS coordinates
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Area Calculator */}
        {activeCoordinates.length > 0 && (
          <AreaCalculator coordinates={activeCoordinates} />
        )}

        {/* Completion Status */}
        {activeCoordinates.length > 0 && isPlotMode && plotProgress === 100 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                🎉 Boundary Complete!
              </CardTitle>
              <CardDescription className="text-green-700">
                All {activeCoordinates.length} boundary points have been successfully plotted!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-green-800 font-medium">
                  Surveying complete! All boundary markers have been physically located and confirmed.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {activeCoordinates.length > 0 && !isPlotMode && !isManualMode && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">🎯 Ready for Field Work!</CardTitle>
              <CardDescription className="text-blue-700">
                Your boundary map is ready. Use GPS tracking to navigate to each point.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  GPS tracking with proximity alerts
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Plot mode for field confirmation
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  GPS-based coordinate recording
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Export coordinates as JSON
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Format Help */}
        {coordinates.length === 0 && manualCoordinates.length === 0 && !error && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Getting Started</CardTitle>
              <CardDescription>
                Upload a JSON file or record coordinates using GPS tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Expected JSON format:</p>
                <pre className="text-sm overflow-x-auto">
{`[
  {"lat": 40.7128, "lng": -74.0060},
  {"lat": 40.7130, "lng": -74.0058},
  {"latitude": 40.7132, "longitude": -74.0056}
]`}
                </pre>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                💡 Supports both lat/lng and latitude/longitude field names
              </p>
              <p className="text-xs text-gray-600 mt-1">
                📍 Or use GPS Recording to walk to each point and record your location
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default LandBoundaryPlotter;