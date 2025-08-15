import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { RotateCcw, X, Check } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onClose: () => void;
}

const ImageCropperModal = ({ imageSrc, onCropComplete, onClose }: ImageCropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImage) {
          onCropComplete(croppedImage);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-xl">
        <div className="relative h-[65%]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1} // Square aspect ratio
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteCallback}
            cropShape="round" // Round cropper
            showGrid={false}
          />
        </div>
        <div className="p-4 space-y-4 text-white">
          <div>
            <label className="block text-sm font-medium">Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rotation</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                aria-labelledby="Rotation"
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <button onClick={() => setRotation(0)} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 flex justify-end items-center gap-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
          >
            <X size={20} /> Cancel
          </button>
          <button
            onClick={showCroppedImage}
            className="flex items-center gap-2 bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-500 transition-colors"
          >
            <Check size={20} /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;