import axiosClient from './axiosClient';

const exclusionApi = {
  getAll: () => axiosClient.get('/exclusions/'),
  create: (data) => axiosClient.post('/exclusions/', data),
  delete: (id) => axiosClient.delete(`/exclusions/${id}`),
  put: (data) => axiosClient.put('/exclusions/', data),
};

export default exclusionApi;
