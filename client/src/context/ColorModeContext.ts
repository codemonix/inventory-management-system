import { createContext } from 'react';

type ColorModeContextValue = { toggleColorMode: () => void };

export const ColorModeContext = createContext<ColorModeContextValue>({
  toggleColorMode: () => {},
});
