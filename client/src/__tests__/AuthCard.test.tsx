import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTheme } from "@mui/material";
import AuthCard from "../components/AuthCard";
import { CustomThemeProvider } from "../context/ThemeContextProvider";

const ModeProbe = () => <span>mode:{useTheme().palette.mode}</span>;

describe('AuthCard', () => {
    it('toggles between light and dark mode on the login screens', () => {
        localStorage.setItem('themeMode', 'light');
        render(
            <CustomThemeProvider>
                <AuthCard><ModeProbe /></AuthCard>
            </CustomThemeProvider>
        );
        expect(screen.getByText('mode:light')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }));

        expect(screen.getByText('mode:dark')).toBeInTheDocument();
        expect(localStorage.getItem('themeMode')).toBe('dark');
    });
});
