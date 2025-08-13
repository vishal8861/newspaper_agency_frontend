import axiosClient from './axiosClient';

const paperApi = {
  getAll: () => axiosClient.get('/papers/'),
  create: (data) => axiosClient.post('/papers/', data),
  put: (data) => axiosClient.put('/papers/', data),
};

export default paperApi;
