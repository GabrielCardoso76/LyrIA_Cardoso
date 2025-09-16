import axios from 'axios';

// NOTE: In a real application, this should be an environment variable.
const baseURL = 'http://172.20.10.12:5001';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
