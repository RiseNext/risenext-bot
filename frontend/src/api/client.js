import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'x-admin-api-key': import.meta.env.VITE_ADMIN_API_KEY || 'change-this-admin-key' }
});
