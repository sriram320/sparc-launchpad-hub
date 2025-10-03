import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, Result, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, X, Check, Camera, CameraOff, RefreshCw } from "lucide-react";
import { useQRCode } from "@/contexts/QRCodeContext";

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
  onScanSuccess: (registrationId: string, participantName: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ 
  open, 
  onClose, 
  eventId,
  onScanSuccess
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<Result | null>(null);
  const { validateQRCode, markQRCodeAsScanned } = useQRCode();
  
  const codeReader = useRef<BrowserMultiFormatReader>(new BrowserMultiFormatReader());
  
  // Start scanning when the component mounts and dialog is open
  useEffect(() => {
    if (open && !isScanning && !scanResult) {
      startScanning();
    }
    
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [open]);
  
  const startScanning = async () => {
    if (!videoRef.current) return;
    
    setError(null);
    setIsScanning(true);
    setScanResult(null);
    
    try {
      await codeReader.current.decodeFromVideoDevice(
        undefined,  // Use default camera
        videoRef.current,
        (result: Result, error: any) => {
          if (result) {
            handleScan(result);
          }
          
          if (error) {
            if (!(error instanceof NotFoundException)) {
              console.error("Scanning error:", error);
              if (error instanceof ChecksumException) {
                setError("QR code checksum error. Please try scanning again.");
              } else if (error instanceof FormatException) {
                setError("Invalid QR code format. Please try a valid SPARC event QR code.");
              }
            }
          }
        }
      );
      
      setCameraPermission(true);
    } catch (err) {
      console.error("Error starting camera:", err);
      setCameraPermission(false);
      setError("Could not access camera. Please check permissions and try again.");
      setIsScanning(false);
    }
  };
  
  const stopScanning = () => {
    codeReader.current.reset();
    setIsScanning(false);
  };
  
  const handleScan = (result: Result) => {
    const scannedValue = result.getText();
    
    // Stop scanning once we get a result
    stopScanning();
    setScanResult(result);
    
    // Validate QR code with our context
    const registration = validateQRCode(scannedValue);
    
    if (!registration) {
      setError("Invalid QR code. This doesn't match any registration.");
      return;
    }
    
    // Check if this is for the current event
    if (registration.eventId !== eventId) {
      setError(`This QR code is for a different event. Found event ID: ${registration.eventId}`);
      return;
    }
    
    // Check if already scanned
    if (registration.scanned) {
      setError(`This attendee (${registration.participantName}) has already been marked present at ${new Date(registration.scanTimestamp!).toLocaleString()}`);
      return;
    }
    
    // Mark attendance
    const success = markQRCodeAsScanned(scannedValue);
    
    if (success) {
      onScanSuccess(registration.registrationId, registration.participantName);
    } else {
      setError("Failed to mark attendance. Please try again.");
    }
  };
  
  const resetScanner = () => {
    setError(null);
    setScanResult(null);
    startScanning();
  };
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            <span>Scan Attendee QR Code</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}
          
          {cameraPermission === false ? (
            <div className="text-center p-8">
              <CameraOff className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
              <p className="mb-4 text-muted-foreground">Camera access denied or not available</p>
              <Button onClick={() => startScanning()}>Request Camera Permission</Button>
            </div>
          ) : (
            <div className="relative w-full max-w-xs aspect-square bg-black rounded-lg overflow-hidden">
              {isScanning && (
                <>
                  <div className="absolute inset-0 border-2 border-primary/50 animate-pulse rounded-lg z-10"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/50 z-20 animate-scan"></div>
                </>
              )}
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
              />
              
              {scanResult && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90">
                  <div className="p-4 text-center">
                    <div className="bg-green-500/20 rounded-full p-3 inline-flex mb-2">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-lg font-medium">QR Code Scanned!</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {scanResult.getText()}
                    </p>
                    <Button variant="outline" size="sm" onClick={resetScanner}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Scan Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Position the QR code within the scanning area
          </p>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          {!isScanning && !scanResult ? (
            <Button onClick={startScanning}>
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          ) : isScanning ? (
            <Button variant="outline" onClick={stopScanning}>
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Scanning
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;

// Add a scan animation keyframe in your global CSS or in a style tag here
const style = document.createElement('style');
style.textContent = `
  @keyframes scan {
    0% {
      top: 5%;
    }
    50% {
      top: 95%;
    }
    100% {
      top: 5%;
    }
  }
  
  .animate-scan {
    animation: scan 2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);