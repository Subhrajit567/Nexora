import axios from "axios";

// Central axios instance — baseURL already includes /api
// Use this everywhere instead of bare axios so the prefix is never forgotten
const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_ENDPOINT}/api`,
  withCredentials: true,
});

export default api;
