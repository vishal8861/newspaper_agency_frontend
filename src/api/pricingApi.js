import axiosClient from './axiosClient';

const pricingApi = {
  getAll: () => axiosClient.get('/papers/paperprice'),
  setPrice: (paperId, data) => axiosClient.post(`/papers/${paperId}/price`, data),
  delete: (id) => axiosClient.delete(`/papers/paperprice/${id}`),
  put: (data) => axiosClient.put('/papers/paperprice', data),
};

export default pricingApi;
