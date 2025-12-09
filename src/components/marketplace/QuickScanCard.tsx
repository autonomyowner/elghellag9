'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface QuickScanCardProps {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location: string;
  image: string;
  href: string;
  index?: number;
}

const QuickScanCard: React.FC<QuickScanCardProps> = ({
  id,
  title,
  price,
  currency = 'دج',
  location,
  image,
  href,
  index = 0,
}) => {
  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('en-US')} ${currency}`;
  };

  return (
    <Link
      href={href}
      className="card-quickscan block stagger-item"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="card-quickscan-image">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="card-quickscan-content">
        <h3 className="card-quickscan-title">{title}</h3>
        <p className="card-quickscan-location">{location}</p>
        <div className="card-quickscan-price">{formatPrice(price, currency)}</div>
      </div>
    </Link>
  );
};

// Skeleton loader for QuickScanCard
export const QuickScanCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-quickscan">
      <div className="skeleton-quickscan-image" />
      <div className="skeleton-quickscan-content">
        <div className="skeleton-quickscan-line" />
        <div className="skeleton-quickscan-line" style={{ width: '70%' }} />
        <div className="skeleton-quickscan-line" style={{ width: '50%' }} />
      </div>
    </div>
  );
};

export default QuickScanCard;
