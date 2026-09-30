import axios from "axios";

export function parseApiError(error) {
  if (axios.isAxiosError(error) && error.response?.data) {
    return { ...error.response.data, status: error.response.status };
  }
  return {
    code: "NETWORK_ERROR",
    message:
      "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng và thử lại.",
  };
}
