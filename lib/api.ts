import axios from "axios";

const baseURL = process?.env?.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({ baseURL });

export default api;
