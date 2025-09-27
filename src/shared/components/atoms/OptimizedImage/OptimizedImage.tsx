import { useState, useCallback } from 'react';
import { useIntersectionObserver } from '@/shared/hooks/useIntersectionObserver';
import { cn } from '@/shared/utils/cn';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  placeholder,
  blurDataURL,
  width,
  height,
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(
    priority ? src : undefined
  );

  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  // Carregar imagem quando ficar visível (se não for priority)
  if (!priority && isVisible && !imageSrc) {
    setImageSrc(src);
  }

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const showPlaceholder = !isLoaded && !hasError;
  const showBlur = blurDataURL && showPlaceholder;

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        className
      )}
      style={{ width, height }}
    >
      {/* Placeholder ou blur */}
      {showPlaceholder && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            showBlur ? 'bg-cover bg-center' : 'bg-gray-200'
          )}
          style={showBlur ? { backgroundImage: `url(${blurDataURL})` } : undefined}
        >
          {!showBlur && (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Imagem principal */}
      {imageSrc && !hasError && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Fallback para erro */}
      {hasError && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          className="w-full h-full object-cover"
        />
      )}

      {/* Fallback genérico para erro */}
      {hasError && !placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-gray-400 text-sm">Imagem não encontrada</div>
        </div>
      )}
    </div>
  );
}