import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

interface QRCodeDisplayProps {
  open: boolean;
  onClose: () => void;
  registrationId: string;
  eventTitle: string;
  userName: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  open, 
  onClose, 
  registrationId, 
  eventTitle,
  userName
}) => {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Registration QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="mb-4 bg-white p-4 rounded-lg">
            <QRCodeSVG 
              value={registrationId} 
              size={200} 
              level="H" 
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-center mb-1">{eventTitle}</p>
          <p className="text-sm text-muted-foreground mb-3">Attendee: {userName}</p>
          <p className="text-xs text-muted-foreground font-mono">{registrationId}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          <Button className="w-full sm:w-auto flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Download QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDisplay;