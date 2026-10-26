import { Box, IconButton, alpha } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { useEffect, useState } from 'react';

function ImageWithCameraOver({ imageUrl, onChange, readOnly = false }) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [imageUrl]);

    const isPlaceholder = !imageUrl || hasError;

    return (
        <Box 
            sx={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
                cursor: isPlaceholder ? 'pointer' : 'default',
                overflow: 'hidden',
                borderRadius: 1,
                bgcolor: 'background.default'
            }}
            onClick={isPlaceholder ? onChange : undefined}
        >
            {isPlaceholder ? (
                <Box 
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'action.hover',
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "action.selected" }
                    }}
                    title="Click to upload image"
                >
                    <BrokenImageIcon color="disabled" fontSize="large" />
                </Box>
            ) : (
                <Box
                    component="img"
                    src={imageUrl}
                    alt='Preview'
                    onError={() => setHasError(true)}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />
            )}

            {!readOnly && (
                <IconButton 
                    size='small'
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: (theme) => alpha(theme.palette.common.black, 0.4),
                        color: (theme) => theme.palette.common.white,
                        backdropFilter: 'blur(4px)',
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.common.white, 0.2),
                        "&:hover": {
                            backgroundColor: (theme) => alpha(theme.palette.common.black, 0.7),
                        },
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange();
                    }}
                >
                    <CameraAltIcon fontSize='small'/>
                </IconButton>
            )}
        </Box>
    );
}

export default ImageWithCameraOver;