import axios from "axios";

/**
 * Parse API error from axios error
 * @param {Error} error - Axios error or standard error
 * @returns {Object} Normalized error object
 */
export function parseApiError(error) {
  // New axios client already normalizes errors with code, status, errors properties
  if (error.isAxiosError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      errors: error.errors,
    };
  }
  
  // Legacy axios error format
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    return {
      code: data.code,
      message: data.message || error.message,
      status: error.response.status,
      errors: data.errors,
    };
  }
  
  // Network or unknown error
  return {
    code: "NETWORK_ERROR",
    message: "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng và thử lại.",
    status: 0,
    errors: null,
  };
}