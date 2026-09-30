import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    const userId = localStorage.getItem("X-User-Id");
    if (userId) {
      config.headers["X-User-Id"] = userId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
  // (error) => {
  //   const message =
  //     error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
  //   return Promise.reject(new Error(message));
  // },
);

export default axiosClient;
