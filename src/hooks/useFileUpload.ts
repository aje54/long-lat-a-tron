import { useState } from 'react';

interface Coordinate {
  id: number;
  lat: number;
  lng: number;
  plotted: boolean;
  original: any;
}

export const useFileUpload = () => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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
          console.log('Coordinates loaded:', validCoords);
          console.log('First coordinate structure:', validCoords[0]);
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

  return {
    coordinates,
    fileName,
    error,
    isDragging,
    handleFileUpload,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearData,
    setCoordinates,
  };
};

// Export the Coordinate type for use in other files
export type { Coordinate };