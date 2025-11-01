import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: Array<{ url: string; caption?: string }>;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
            data-testid="button-close-lightbox"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 h-12 w-12"
              data-testid="button-previous"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Image */}
          <div className="flex flex-col items-center justify-center w-full h-full p-16">
            <img
              src={currentImage.url}
              alt={currentImage.caption || `Image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
              data-testid="img-lightbox"
            />
            
            {/* Caption and counter */}
            <div className="mt-6 text-center space-y-2">
              {currentImage.caption && (
                <p className="text-white text-sm" data-testid="text-lightbox-caption">
                  {currentImage.caption}
                </p>
              )}
              {images.length > 1 && (
                <p className="text-white/60 text-xs" data-testid="text-image-counter">
                  {currentIndex + 1} / {images.length}
                </p>
              )}
            </div>
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 h-12 w-12"
              data-testid="button-next"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
