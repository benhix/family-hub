'use client';

import { useState, useRef } from 'react';
import { X, Camera, Check, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserDisplayName } from '../hooks/useUserDisplayName';

interface QRCodeScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QRCodeScanner({ isVisible, onClose, onSuccess }: QRCodeScannerProps) {
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setMessage(null);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          scanQRCode();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setMessage({ type: 'error', text: 'Unable to access camera. Please check permissions.' });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to scan for QR codes
      const { default: jsQR } = await import('jsqr');
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        setScanResult(code.data);
        await handleQRCodeScanned(code.data);
      } else if (isScanning) {
        // Continue scanning
        requestAnimationFrame(() => scanQRCode());
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      if (isScanning) {
        requestAnimationFrame(() => scanQRCode());
      }
    }
  };

  const handleQRCodeScanned = async (data: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    stopScanning();
    
    try {
      // Check if this is our pet feeding QR code
      if (data === 'FAMILY_DASH_PET_FEEDING_BOTH') {
        const response = await fetch('/api/pet-feeding/qr-scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrCode: data,
            triggeredBy: userDisplayName,
            triggeredByUserId: user?.id,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setMessage({ 
            type: 'success', 
            text: `✅ Both pets marked as fed for ${result.mealTime}!` 
          });
          
          // Call success callback after a delay
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
        } else {
          const error = await response.json();
          setMessage({ 
            type: 'error', 
            text: error.message || 'Failed to update feeding status' 
          });
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Invalid QR code. Please scan the pet feeding QR code.' 
        });
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error processing QR code. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopScanning();
    setScanResult(null);
    setMessage(null);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Scan Pet Feeding QR Code
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Camera View */}
          <div className="relative">
            <video
              ref={videoRef}
              className={`w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg object-cover ${
                isScanning ? 'block' : 'hidden'
              }`}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {!isScanning && !message && (
              <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Tap to start scanning
                  </p>
                </div>
              </div>
            )}

            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-blue-500 rounded-lg">
                  <div className="w-full h-full border-2 border-blue-500 rounded-lg animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {message.type === 'success' ? (
                <Check size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>• Position the QR code within the scanning area</p>
            <p>• Make sure the code is well-lit and not blurry</p>
            <p>• The correct QR code will mark both pets as fed</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isScanning && !isProcessing && (
              <button
                onClick={startScanning}
                className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={18} />
                Start Scanning
              </button>
            )}
            
            {isScanning && (
              <button
                onClick={stopScanning}
                className="flex-1 bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Stop Scanning
              </button>
            )}
            
            {isProcessing && (
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                Processing...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 