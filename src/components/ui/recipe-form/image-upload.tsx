import { ImagePlus, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { Button } from '../button'

interface ImageUploadProps {
  images: { url: string; stepNumber?: number }[]
  onImagesChange: (images: { url: string; stepNumber?: number }[]) => void
  maxImages?: number
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onImagesChange(newImages)
  }

  const handleStepNumberChange = (index: number, stepNumber?: number) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], stepNumber }
    onImagesChange(newImages)
  }

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      const newImages: { url: string }[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await response.json();
        newImages.push({ url });
      }

      onImagesChange([...images, ...newImages].slice(0, maxImages));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, index) => (
          <div key={image.url} className="relative aspect-square">
            <Image
              src={image.url}
              alt={`Recipe image ${index + 1}`}
              fill
              className="rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
            <select
              value={image.stepNumber || ''}
              onChange={(e) =>
                handleStepNumberChange(
                  index,
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-sm"
            >
              <option value="">Main photo</option>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Step {i + 1}
                </option>
              ))}
            </select>
          </div>
        ))}
        {images.length < maxImages && (
          <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4">
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-gray-600">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                    disabled={isUploading}
                  />
                  <ImagePlus className="h-8 w-8 text-gray-600" />
                  <span className="text-sm text-gray-600">Upload Image</span>
                </label>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Upload up to {maxImages} images. First image will be the main recipe photo.
      </p>
    </div>
  )
}
