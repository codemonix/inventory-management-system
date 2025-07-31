import api from "./api/api";
import App from "./App";


let API_URL, API_PORT;

if (import.meta.env.DEV) {
    API_URL = import.meta.env.VITE_API_BASE_URL;
    API_PORT = import.meta.env.VITE_API_PORT;
} else {
    API_URL = window?.__IMS_CONFIG__?.API_URL;
    API_PORT = window?.__IMS_CONFIG__?.API_PORT;
}

if (!API_URL) {
    throw new Error("Missing API_URL configuration!")
}

const fullApiUrl = API_PORT ? `${API_URL}:${API_PORT}/api` : `${API_URL}/api`;

export default { API_URL: fullApiUrl, };