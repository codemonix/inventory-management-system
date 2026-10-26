import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CustomThemeProvider } from './context/ThemeContextProvider'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import store from './redux/store'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
        <CustomThemeProvider>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </CustomThemeProvider>
    </Provider>
  </StrictMode>,
)
