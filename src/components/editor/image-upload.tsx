'use client'

import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface ImageUploadProps {
  onUpload: (url: string) => void
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setUploading(true)
        const file = acceptedFiles[0];
        if (!file) {
          toast.error('No file selected');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Upload failed');
        }

        const { url } = await response.json();
        if (!url) {
          throw new Error('No URL returned from upload');
        }

        onUpload(url);
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setUploading(false)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
  })

  return (
    <div className="relative">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ImageIcon className="h-4 w-4" />
            <span>
              {isDragActive
                ? 'Drop image here'
                : 'Drag & drop or click to upload'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
