import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import LoginForm from "../components/LoginForm";
import { fetchPublicSettings } from "../services/settingsService";

vi.mock('../services/settingsService', () => ({
    fetchPublicSettings: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ login: vi.fn() }),
}));

const mockedPublicSettings = vi.mocked(fetchPublicSettings);

describe('LoginForm demo mode', () => {
    beforeEach(() => mockedPublicSettings.mockReset());

    it('offers the demo account when an admin turned demo mode on', async () => {
        mockedPublicSettings.mockResolvedValue({ demoMode: true });
        render(<LoginForm />);

        fireEvent.click(await screen.findByRole('button', { name: 'Auto-Fill' }));

        expect(screen.getByLabelText(/email/i)).toHaveValue('demo@ims.com');
        expect(screen.getByLabelText(/password/i)).toHaveValue('demo123');
    });

    it('hides the demo button when demo mode is off', async () => {
        mockedPublicSettings.mockResolvedValue({ demoMode: false });
        render(<LoginForm />);

        await vi.waitFor(() => expect(mockedPublicSettings).toHaveBeenCalled());
        expect(screen.queryByRole('button', { name: 'Auto-Fill' })).not.toBeInTheDocument();
    });
});
