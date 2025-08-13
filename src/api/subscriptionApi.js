import axiosClient from './axiosClient';

const subscriptionApi = {
  getAll: () => axiosClient.get('/subscriptions/'),
  create: (data) => axiosClient.post('/subscriptions/', data),
  put: (data) => axiosClient.put('/subscriptions/', data),
  delete: (id) => axiosClient.delete(`/subscriptions/${id}`),
  getByFilter: (params) => axiosClient.get('/subscriptions/filter', { params }),
};

export default subscriptionApi;
