import { useEffect, useRef, useState } from "react";
import { logError, logWarning } from "../utils/logger";

let sharedDefaultBlobUrl = null;
let fetchingDefaultPromise = null;

// Helper function to get the default blob ONLY once (singleton)
const getSharedDefultBlob = async ( fallBackUrl, fetchFunction ) => {

    if (sharedDefaultBlobUrl) return sharedDefaultBlobUrl;

    if (!fetchingDefaultPromise) {
        fetchingDefaultPromise = fetchFunction(fallBackUrl)
            .then( url => {
                sharedDefaultBlobUrl = url;
                return url;
            })
            .catch(error => {
                logError("Failed to create shared default blob", error.message);
                return fallBackUrl;
            });
    }
    return fetchingDefaultPromise;
};




export const useManagedImage = ( imagePath, fetchFunction, fallBackUrl ) => {
    
    const [ displayUrl, setDisplayUrl ] = useState( null );
    const [ previewUrl, setPreviewUrl ] = useState( null );
    const [ isImageLoading, setIsImageLoading ] = useState( true );
    const activeBlobRef = useRef( null );

    const cleanupOldBlob = () => {
        if ( 
            activeBlobRef.current && 
            activeBlobRef.current !== sharedDefaultBlobUrl
        ) {
            URL.revokeObjectURL( activeBlobRef.current );
        }
    };

    useEffect(() => {
        const loadImages = async () => {
            setIsImageLoading(true);

            if (imagePath && imagePath !== fallBackUrl) {
                try {
                    const blobUrl = await fetchFunction(imagePath);
                    cleanupOldBlob();
                    activeBlobRef.current = blobUrl;
                    setDisplayUrl(blobUrl);
                    setPreviewUrl(null);
                    setIsImageLoading(false);
                    return;
                } catch (error) {
                    logWarning("Fail to load image for path:", imagePath);
                    logWarning("Image load failed:", error.message);
                    logWarning("falling back to default image");
                }
            }
    
            const defaultBlob = await getSharedDefultBlob(fallBackUrl, fetchFunction);
            setDisplayUrl(defaultBlob);
            setIsImageLoading(false);
        };
        loadImages();
    
        return () => cleanupOldBlob();
},[imagePath, fallBackUrl, fetchFunction])

    const setLocalPreview = (file) => {
        // cleanupOldBlob();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const newBlobUrl = URL.createObjectURL(file);
        setPreviewUrl(newBlobUrl);
        // activeBlobRef.current = newBlobUrl;
        // setDisplayUrl(newBlobUrl);
    };
    const clearLocalPreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const currentDisplayUrl = previewUrl || displayUrl;
    return { displayUrl, setLocalPreview, clearLocalPreview, isImageLoading };
};