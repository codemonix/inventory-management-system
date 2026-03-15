import { Dialog, DialogTitle, DialogContent, IconButton, Tooltip, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';

export default function LogDetailsDialog({ open, onClose, logData }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (logData) {
            navigator.clipboard.writeText(JSON.stringify(logData, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // If there's no data, don't try to render the modal content
    if (!logData) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <span>Log Metadata</span>
                <div>
                    <Tooltip title={copied ? "Copied!" : "Copy JSON"}>
                        <IconButton onClick={handleCopy} size="small" sx={{ mr: 1 }}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent dividers sx={{ backgroundColor: '#1e1e1e', p: 0 }}>
                <pre style={{ 
                    margin: 0,
                    padding: '16px',
                    color: '#d4d4d4', 
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto'
                }}>
                    {JSON.stringify(logData, null, 2)}
                </pre>
            </DialogContent>
        </Dialog>
    );
}