import Image from 'next/image';
import { useState } from 'react';

interface ShopLogoProps {
  shopName: string;
  className?: string;
}

export default function ShopLogo({ shopName, className = '' }: ShopLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <span className="text-lg font-semibold text-gray-800">{shopName}</span>
      </div>
    );
  }

  return (
    <Image
      src={`/images/${shopName.toLowerCase()}-logo.png`}
      alt={`${shopName} logo`}
      width={100}
      height={50}
      className={className}
      onError={() => setImageError(true)}
    />
  );
} 