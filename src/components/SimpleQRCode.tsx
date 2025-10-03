import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SimpleQRProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * A simple QR code display component without a modal
 */
const SimpleQRCode: React.FC<SimpleQRProps> = ({ 
  value, 
  size = 200,
  className = ""
}) => {
  return (
    <div className={`bg-white p-2 rounded-lg ${className}`}>
      <QRCodeSVG 
        value={value} 
        size={size} 
        level="H" 
        includeMargin={true}
      />
    </div>
  );
};

export default SimpleQRCode;