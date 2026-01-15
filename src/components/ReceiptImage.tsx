import React from 'react';
import { Eye } from 'lucide-react';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface ReceiptImageProps {
  filePath: string | null | undefined;
  className?: string;
  alt?: string;
  onClick?: () => void;
  showHoverOverlay?: boolean;
}

/**
 * Component to securely display receipt images using signed URLs
 * This ensures private bucket files are only accessible to authenticated users
 */
export function ReceiptImage({ 
  filePath, 
  className = "w-12 h-12 object-cover rounded border border-input cursor-pointer",
  alt = "Receipt",
  onClick,
  showHoverOverlay = true
}: ReceiptImageProps) {
  const { url, loading, error } = useSignedUrl('receipts', filePath, 3600);

  if (!filePath) return null;

  if (loading) {
    return (
      <div className={`${className} bg-muted animate-pulse flex items-center justify-center`}>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-xs text-muted-foreground">Error</span>
      </div>
    );
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Open signed URL in new tab
      window.open(url, '_blank');
    }
  };

  if (showHoverOverlay) {
    return (
      <div className="relative group">
        <img 
          src={url} 
          alt={alt} 
          className={className}
          onClick={handleClick}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center cursor-pointer" onClick={handleClick}>
          <Eye className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt={alt} 
      className={className}
      onClick={handleClick}
    />
  );
}

export default ReceiptImage;
