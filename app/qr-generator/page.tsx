'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Printer, QrCode } from 'lucide-react';
import Link from 'next/link';
import QRCodeLib from 'qrcode';

export default function QRGeneratorPage() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      
      // Generate QR code with URL to our pet feeding page
      // This will be scannable by iPhone camera app and open the web app
      const qrCodeData = `https://hickshub.life/qr-scan/pet-feeding`;
      
      const options = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      // Generate QR code as data URL
      const dataUrl = await QRCodeLib.toDataURL(qrCodeData, options);
      setQrCodeDataUrl(dataUrl);

      // Also generate on canvas for download functionality
      if (canvasRef.current) {
        await QRCodeLib.toCanvas(canvasRef.current, qrCodeData, options);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    // Create download link
    const link = document.createElement('a');
    link.download = 'pet-feeding-qr-code.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const printQRCode = () => {
    if (!qrCodeDataUrl) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pet Feeding QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #000;
              padding: 20px;
              border-radius: 10px;
              background: white;
            }
            .qr-code {
              margin: 20px 0;
            }
            h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            p {
              margin: 5px 0;
              font-size: 14px;
              color: #666;
            }
            .instructions {
              max-width: 400px;
              margin-top: 20px;
              text-align: left;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>🐾 Pet Feeding QR Code</h1>
            <p>Scan with iPhone camera to automatically mark both pets as fed</p>
            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="Pet Feeding QR Code" />
            </div>
            <!-- <div class="instructions">
              <h3>Instructions:</h3>
              <ol>
                <li>Cut out this QR code</li>
                <li>Place it near the pet food area</li>
                <li>Use the Family Dashboard app to scan</li>
                <li>Both dog and cat will be marked as fed!</li>
              </ol>
            </div> -->
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-4">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/alerts" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">QR Code Generator</h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* QR Code Display */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pet Feeding QR Code
            </h2>
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="text-center">
              {qrCodeDataUrl && (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Pet Feeding QR Code" 
                  className="mx-auto mb-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan this QR code with your iPhone camera to automatically mark both pets as fed
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={printQRCode}
                  className="flex-1 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-6 hidden">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How to Use
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <p>Download or print the QR code above</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <p>Place it near your pet feeding area (fridge, pantry, etc.)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <p>After feeding both pets, open the Family Dashboard app</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <p>Tap the QR code button in the Pet Feeding widget and scan</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
              <p>Both dog and cat will be automatically marked as fed!</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Features
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <p>Works with iPhone camera app (no special app needed)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <p>Automatically marks both pets as fed</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <p>Opens your saved Family Dashboard app</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <p>No confirmation needed - instant feeding update</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <p>Automatically detects current meal time</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <p>Records who fed the pets and when</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 