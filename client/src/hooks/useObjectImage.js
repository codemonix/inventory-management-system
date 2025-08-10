import { useEffect, useState } from "react";
import { logError } from "../utils/logger";


export function useObjectImage( imagePath, fetchFunction ) {
    const [ imageObjectUrl , setImageObjectUrl ] = useState(null);

    useEffect(() => {
        if ( !imagePath ) return;

        let isCancelled = false;

        const loadImage = async () => {
            try {
                const url = await fetchFunction(imagePath);
                if (!isCancelled) {
                    setImageObjectUrl( prev => {
                        if (prev) URL.revokeObjectURL(prev);
                        return url;
                    });
                }
            } catch ( error ) {
                logError("Image load failed:", error.message);
            }
        };

        loadImage();

        return () => {
            isCancelled = true;
            setImageObjectUrl( prev => {
                if ( prev ) URL.revokeObjectURL( prev );
                return null;
            });
        };
    }, [ imagePath, fetchFunction ]);

    return imageObjectUrl;
}