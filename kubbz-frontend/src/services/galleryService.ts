import api from './api';
import { GalleryImage } from '../types/gallery';

export const galleryService = {
  async getAllImages(): Promise<GalleryImage[]> {
    try {
      const response = await api.get('/gallery', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.map((image: any) => ({
        ...image,
        created_at: new Date(image.created_at).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }
  },

  async uploadImage(file: File, caption?: string): Promise<GalleryImage> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await api.post('/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return {
        ...response.data,
        created_at: new Date(response.data.created_at).toISOString(),
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async deleteImage(imageId: string): Promise<void> {
    try {
      await api.delete(`/gallery/${imageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },
};
