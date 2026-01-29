import axios from 'axios';

const API_URL = 'http://localhost:8001/devices';

// Create axios instance with interceptor
const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getDevices = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error("Error fetching devices:", error);
        throw error;
    }
};

export const createDevice = async (device) => {
    try {
        const response = await api.post('/', device);
        return response.data;
    } catch (error) {
        console.error("Error creating device:", error);
        throw error;
    }
};

export const deleteDevice = async (id) => {
    try {
        await api.delete(`/${id}`);
    } catch (error) {
        console.error("Error deleting device:", error);
        throw error;
    }
};

