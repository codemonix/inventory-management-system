import { Box, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

function ImageWithCameraOver ({ imageUrl, onChange }) {
    return (
        <Box 
            position={'relative'}
            width={100}
            height={100}
            sx={{ cursor: 'pointer'}}
        >
            <img 
                src={imageUrl}
                alt='Preview'
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 4,
                }}
            />
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
                onClick={onChange}
                >
                <CameraAltIcon fontSize='small'/>

            </IconButton>
            
        </Box>
    )
}

export default ImageWithCameraOver;