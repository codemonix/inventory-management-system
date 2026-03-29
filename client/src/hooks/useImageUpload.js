import { useState } from "react";
import imageCompressor from "browser-image-compression";
import api from "../api/api";
import { logDebug, logError, logInfo } from "../utils/logger";

export const useImageUpload = ({ onSuccess, setLocalPreview, clearLocalPreview }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const compressImage = async (file) => {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
        try {
            const compressedBlob = await imageCompressor(file, options);
            return new File([compressedBlob], file.name, {
                type: file.type,
                lastModified: Date.now(),
            });
        } catch (error) {
            logError("Error compressing image:", error.message);
            return file; // Fallback to original file
        }
    };

    const triggerImageUpload = (itemCode, itemId) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setIsUploading(true);
            setUploadError(null);

            const compressedImage = await compressImage(file);
            if (setLocalPreview) setLocalPreview(compressedImage);

            try {
                const formData = new FormData();
                formData.append("itemCode", itemCode); 
                formData.append("image", compressedImage);

                const response = await api.post(`/items/${itemId}/update-image`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                
                });
                logDebug("Image upload response:", response.data);
                if (onSuccess) onSuccess(itemId, response.data.item.imageUrl);
                logInfo("Image uploded successfully")
            } catch (error) {
                logError("useImageUpload -> Error uploading image:", error.message);
                const userMessage = error.response?.data?.message || "Failed to upload image.";
                setUploadError(error.message);
                if (clearLocalPreview) clearLocalPreview();
            } finally {
                setIsUploading(false);

            }
        };
        input.click();
    };

    return { isUploading, uploadError, clearError: () => setUploadError(null), triggerImageUpload }
}