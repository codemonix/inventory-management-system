import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "../components/ErrorBoundary";

const Boom = (): never => {
    throw new Error('render failed');
};

describe('ErrorBoundary', () => {
    it('shows a recoverable message instead of a blank page', () => {
        // React logs caught render errors to the console; keep the test output clean
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(<ErrorBoundary><Boom /></ErrorBoundary>);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
        spy.mockRestore();
    });

    it('clears the error when the reset key changes', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { rerender } = render(<ErrorBoundary resetKey="/a"><Boom /></ErrorBoundary>);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();

        rerender(<ErrorBoundary resetKey="/b"><p>Recovered</p></ErrorBoundary>);
        expect(screen.getByText('Recovered')).toBeInTheDocument();
        spy.mockRestore();
    });
});
