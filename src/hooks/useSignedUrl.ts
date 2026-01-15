import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignedUrlState {
  url: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to generate signed URLs for private storage files
 * @param bucket - The storage bucket name
 * @param filePath - The file path within the bucket (can also be a full URL from which path is extracted)
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export function useSignedUrl(
  bucket: string,
  filePath: string | null | undefined,
  expiresIn: number = 3600
): SignedUrlState {
  const [state, setState] = useState<SignedUrlState>({
    url: null,
    loading: !!filePath,
    error: null,
  });

  useEffect(() => {
    if (!filePath) {
      setState({ url: null, loading: false, error: null });
      return;
    }

    let isMounted = true;

    const generateSignedUrl = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Extract just the file path if a full URL was stored
        let path = filePath;
        
        // Check if it's a full URL and extract the path after /object/public/ or /object/sign/
        if (filePath.includes('/object/public/')) {
          const urlParts = filePath.split('/object/public/');
          if (urlParts.length > 1) {
            // Remove bucket name from path if present
            const pathWithBucket = urlParts[1];
            const bucketPrefix = `${bucket}/`;
            path = pathWithBucket.startsWith(bucketPrefix) 
              ? pathWithBucket.substring(bucketPrefix.length)
              : pathWithBucket;
          }
        } else if (filePath.includes('/storage/v1/object/')) {
          // Handle other storage URL formats
          const match = filePath.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/);
          if (match) {
            path = match[1];
          }
        }

        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn);

        if (!isMounted) return;

        if (error) {
          console.error('Error generating signed URL:', error);
          setState({ url: null, loading: false, error: error.message });
          return;
        }

        setState({ url: data.signedUrl, loading: false, error: null });
      } catch (err) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate signed URL';
        setState({ url: null, loading: false, error: errorMessage });
      }
    };

    generateSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [bucket, filePath, expiresIn]);

  return state;
}

/**
 * Generate a signed URL for a file (non-hook version for one-time use)
 */
export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    // Extract just the file path if a full URL was stored
    let path = filePath;
    
    if (filePath.includes('/object/public/')) {
      const urlParts = filePath.split('/object/public/');
      if (urlParts.length > 1) {
        const pathWithBucket = urlParts[1];
        const bucketPrefix = `${bucket}/`;
        path = pathWithBucket.startsWith(bucketPrefix) 
          ? pathWithBucket.substring(bucketPrefix.length)
          : pathWithBucket;
      }
    } else if (filePath.includes('/storage/v1/object/')) {
      const match = filePath.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/);
      if (match) {
        path = match[1];
      }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Error in getSignedUrl:', err);
    return null;
  }
}
