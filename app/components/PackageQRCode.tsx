"use client";

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload } from 'react-icons/fa';

interface PackageQRCodeProps {
  trackingNumber: string;
  size?: number;
  showDownload?: boolean;
}

export default function PackageQRCode({ trackingNumber, size = 128, showDownload = false }: PackageQRCodeProps) {
  const qrRef = useRef<SVGSVGElement>(null);
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/track/${trackingNumber}`;

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `package-${trackingNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeSVG
        ref={qrRef}
        value={trackingUrl}
        size={size}
        level="H"
        includeMargin={true}
        className="bg-white p-2 rounded-lg"
      />
      {showDownload && (
        <button
          onClick={downloadQRCode}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mt-2"
          title="تحميل رمز QR"
        >
          <FaDownload />
          <span>تحميل</span>
        </button>
      )}
      <p className="text-sm text-gray-600 text-center mt-2" dir="rtl">
        امسح رمز QR لتتبع الطرد
      </p>
    </div>
  );
} 