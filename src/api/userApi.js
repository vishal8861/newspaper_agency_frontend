import axiosClient from './axiosClient';

const userApi = {
  getAll: () => axiosClient.get('/users/'),
  getByFilter: (params) => axiosClient.get('/users/by-filter', { params }),
  create: (data) => axiosClient.post('/users/', data),
  delete: (id) => axiosClient.delete(`/users/${id}`),
  put: (data) => axiosClient.put('/users/', data),
};

export default userApi;