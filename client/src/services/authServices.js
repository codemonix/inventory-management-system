import api from "../api/api.js";


export const loginApi = async ( email, password ) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data; // { token, user }
};

export const register = async ( email, password ) => {
    const res = await api.post("/auth/register", { email, password });
    return res.data; // { token, user }
};


export const fetchUserData = async () => {
    const res = await api.get("/auth/me");
    return res.data; // { user: { id, name, email, role } }
}
