import { useState } from 'react';
import imageCompressor from 'browser-image-compression';
import api, { isApiError } from '../api/api';
import { getBackendMessage } from '../utils/backendMessage';
import { logDebug, logError, logInfo, logWarning } from '../utils/logger';

type UseImageUploadArgs = {
  onSuccess?: (itemId: string, imageUrl: string) => void;
  setLocalPreview?: (file: File) => void;
  clearLocalPreview?: () => void;
};

export const useImageUpload = ({ onSuccess, setLocalPreview, clearLocalPreview }: UseImageUploadArgs) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const compressImage = async (file: File): Promise<File> => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
    try {
      const compressedBlob = await imageCompressor(file, options);
      return new File([compressedBlob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logError('Error compressing image:', message);
      logWarning('Falling back to original image');
      return file;
    }
  };

  const triggerImageUpload = (itemCode: string, itemId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement | null)?.files;
      const file = files?.[0];
      if (!file) return;

      setIsUploading(true);
      setUploadError(null);

      const compressedImage = await compressImage(file);
      setLocalPreview?.(compressedImage);

      try {
        const formData = new FormData();
        formData.append('itemCode', itemCode);
        formData.append('image', compressedImage);

        const response = await api.post<{ item: { imageUrl: string } }>(
          `/items/${itemId}/update-image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );

        logDebug('Image upload response:', response.data);
        onSuccess?.(itemId, response.data.item.imageUrl);
        logInfo('Image uploaded successfully');
      } catch (error: unknown) {
        if (isApiError(error)) {
          const message = getBackendMessage(error) ?? 'Failed to upload image.';
          logError('useImageUpload -> Error uploading image:', error.message);
          setUploadError(message);
        } else {
          const message = error instanceof Error ? error.message : 'Failed to upload image.';
          logError('useImageUpload -> Error uploading image:', message);
          setUploadError(message);
        }
        clearLocalPreview?.();
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  };

  return { isUploading, uploadError, clearError: () => setUploadError(null), triggerImageUpload };
};

