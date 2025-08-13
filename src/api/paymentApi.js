import axiosClient from './axiosClient';

const paymentApi = {
  getAll: () => axiosClient.get('/payment/'),
  getByFilter: (params) => axiosClient.get('/payment/by-filter', { params }),
  create: (data) => axiosClient.post('/payment/', data),
  put: (data) => axiosClient.put('/payment/', data),
  delete: (id) => axiosClient.delete(`/payment/${id}`),
};

export default paymentApi;