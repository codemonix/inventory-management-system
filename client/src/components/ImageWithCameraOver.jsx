import { Box, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { useEffect, useState } from 'react';

function ImageWithCameraOver ({ imageUrl, onChange, readOnly = false }) {
    const [ hasError, setHasError ] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [imageUrl])

    return (
        <Box 
            position={'relative'}
            width={100}
            height={100}
            sx={{ cursor: 'pointer'}}
            onClick={(!imageUrl || hasError) ? onChange : undefined}
        >
            {(!imageUrl || hasError) ? (
                <Box 
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1,
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "#e0e0e0" }
                    }}
                    title="Click to upload image"
                >
                    <BrokenImageIcon color="disabled" fontSize="large" />
                </Box>
            ) : (
                <img 
                    src={imageUrl}
                    alt='Preview'
                    onError={() => setHasError(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 4,
                    }}
                />
            )}
            (!readOnly && (
                <IconButton 
                    size='small'
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        color: 'rgba(255, 255, 255, 0.4)',
                        "&:hover": {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'rgba(255,255,255, 0.7)'
                        },

                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange();
                    }}
                    >
                    <CameraAltIcon fontSize='small'/>

                </IconButton>
            ));
            
        </Box>
    )
}

export default ImageWithCameraOver;