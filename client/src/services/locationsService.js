import api from "../api/api.js";

export const getLocations = async () => api.get("/locations").then((res) => res.data); // { locations: [...] }

export const createLocation = async (location) => api.post("/locations", location).then((res) => res.data); // { location: { id, name, description } }

export const updateLocation = async (id, location) => api.put(`/locations/${id}`, location).then((res) => res.data); // { location: { id, name, description } }

export const deleteLocation = async (id) => api.delete(`/locations/${id}`).then((res) => res.data); // { message: "Location deleted successfully" }