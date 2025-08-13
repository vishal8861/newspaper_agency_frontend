import axios from 'axios';

const axiosClient = axios.create({
  // baseURL: 'http://localhost:8000', // Change if needed
  baseURL: 'https://newspaper-agency-backend.onrender.com',
});

export default axiosClient;