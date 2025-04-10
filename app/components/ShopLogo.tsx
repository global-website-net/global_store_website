import Image from 'next/image';
import { useState } from 'react';

interface ShopLogoProps {
  shopName: string;
  logoPath: string;
  width?: number;
  height?: number;
}

export default function ShopLogo({ shopName, logoPath, width = 100, height = 40 }: ShopLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div 
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FF0080',
          color: 'white',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {shopName}
      </div>
    );
  }

  return (
    <Image
      src={logoPath}
      alt={`${shopName} logo`}
      width={width}
      height={height}
      onError={() => setImageError(true)}
      style={{ objectFit: 'contain' }}
    />
  );
} 