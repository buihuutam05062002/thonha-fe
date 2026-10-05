import axios from "axios";

/**
 * Unified Axios client for Thonha FE
 * 
 * Backend returns ApiResponse wrapper:
 * {
 *   success: boolean,
 *   code: string,
 *   message: string,
 *   data: T,
 *   errors: object,
 *   timestamp: string,
 *   path: string
 * }
 * 
 * This client extracts `data` from successful responses and throws
 * structured errors for failed responses.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8082/api/v1";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach access token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle ApiResponse wrapper and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => {
    // Backend wraps data in ApiResponse { success, code, message, data, ... }
    // Extract the actual data for convenience
    const apiResponse = response.data;
    if (apiResponse && typeof apiResponse === "object" && "success" in apiResponse) {
      if (apiResponse.success) {
        return apiResponse.data;
      }
      // Backend returned error in ApiResponse format
      const error = new Error(apiResponse.message || "Request failed");
      error.code = apiResponse.code;
      error.errors = apiResponse.errors;
      error.status = response.status;
      throw error;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - token expired, try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;
        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        localStorage.setItem("accessToken", newAccessToken);
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear session and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error for consistent handling
    const apiError = error.response?.data;
    const normalizedError = new Error(
      apiError?.message || error.message || "Có lỗi xảy ra"
    );
    normalizedError.code = apiError?.code || error.code;
    normalizedError.errors = apiError?.errors;
    normalizedError.status = error.response?.status;
    normalizedError.isAxiosError = true;

    return Promise.reject(normalizedError);
  }
);

export default axiosClient;