import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { logError } from '../utils/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    // Change this (e.g. to the current path) to clear the error after navigating
    resetKey?: unknown;
}

interface ErrorBoundaryState {
    error: Error | null;
}

// Shows a recoverable error message instead of a blank page when rendering throws.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        logError('ErrorBoundary caught a render error:', error.message, info.componentStack);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ error: null });
        }
    }

    render() {
        if (!this.state.error) return this.props.children;
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, px: 2 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                            Reload
                        </Button>
                    }
                >
                    <AlertTitle>Something went wrong</AlertTitle>
                    This part of the page failed to load. Try again, or reload the page.
                    <Box sx={{ mt: 1 }}>
                        <Button size="small" variant="outlined" color="inherit" onClick={() => this.setState({ error: null })}>
                            Try again
                        </Button>
                    </Box>
                </Alert>
            </Box>
        );
    }
}
