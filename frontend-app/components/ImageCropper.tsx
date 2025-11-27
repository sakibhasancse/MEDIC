import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: any) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, onSave }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    onCropComplete(croppedAreaPixels);
  }, [onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-2xl h-[600px] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Crop Image</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="relative flex-1 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
