import axios from "axios";

const service = axios.create(); // Request interceptors

service.interceptors.request.use(
  (config) => {
    // do something
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
); // Response interceptors

service.interceptors.response.use(
  async (response) => {
    // do something
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);

export default service;