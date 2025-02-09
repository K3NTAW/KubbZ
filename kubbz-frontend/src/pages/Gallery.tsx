import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { galleryService } from '../services/galleryService';
import { UploadImageModal } from '../components/gallery/UploadImageModal';
import { ImageGrid } from '../components/gallery/ImageGrid';
import { GalleryImage } from '../types/gallery';

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/gallery' } });
      return;
    }
    loadImages();
  }, [isAuthenticated]);

  const loadImages = async () => {
    try {
      const fetchedImages = await galleryService.getAllImages();
      setImages(fetchedImages);
    } catch (error: any) {
      console.error('Error loading images:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view the gallery');
        navigate('/login', { state: { from: '/gallery' } });
      } else {
        toast.error('Failed to load gallery images');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File, caption?: string) => {
    try {
      const newImage = await galleryService.uploadImage(file, caption);
      setImages(prevImages => [newImage, ...prevImages]);
      toast.success('Image uploaded successfully');
      setIsUploadModalOpen(false);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to upload images');
        navigate('/login', { state: { from: '/gallery' } });
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload image');
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!user?.is_admin) {
      toast.error('Only administrators can delete images');
      return;
    }

    try {
      await galleryService.deleteImage(imageId);
      setImages(prevImages => prevImages.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to delete images');
        navigate('/login', { state: { from: '/gallery' } });
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete image');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery</h1>
        {isAuthenticated && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Image
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={image.url}
              alt={image.caption || 'Gallery image'}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              {image.caption && (
                <p className="text-gray-600 dark:text-gray-300">{image.caption}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Uploaded by {image.uploader_name}
              </p>
              {user?.is_admin && (
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isUploadModalOpen && (
        <UploadImageModal
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleImageUpload}
        />
      )}
    </div>
  );
}
