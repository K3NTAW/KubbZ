import React from 'react';
import { format } from 'date-fns';
import { GalleryImage } from '../../types/gallery';

interface ImageGridProps {
  images: GalleryImage[];
}

export function ImageGrid({ images }: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-200 hover:scale-105"
        >
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={image.url}
              alt={image.caption || 'Gallery image'}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
          <div className="p-4">
            {image.caption && (
              <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">{image.caption}</p>
            )}
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{image.uploaded_by}</span>
              <span>{format(new Date(image.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
