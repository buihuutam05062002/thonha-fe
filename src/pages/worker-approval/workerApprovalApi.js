import axios from "axios";
import { API_BASE_URL } from "../user-management/userApi"; // đổi lại đường dẫn nếu userApi.js ở chỗ khác

export const STATUSES = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
];

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message ?? `Lỗi ${err.response?.status ?? "mạng"}: không thể tải dữ liệu`;
    return Promise.reject(new Error(msg));
  }
);

// Backend đang lấy reviewerId qua header X-Reviewer-Id (tạm thời, chưa có Security).
// Sau khi có đăng nhập, lưu id admin vào đây.
function reviewerId() {
  return localStorage.getItem("reviewerId") || 1;
}

export async function fetchWorkerProfiles({ status = "PENDING", keyword, city, page = 0, size = 10 }) {
  const { data } = await api.get("/api/worker-profiles", {
    params: {
      status: status || undefined,
      keyword: keyword?.trim() || undefined,
      city: city?.trim() || undefined,
      page,
      size,
    },
  });
  return data;
}

export async function fetchWorkerProfileDetail(id) {
  const { data } = await api.get(`/api/worker-profiles/${id}`);
  return data;
}

export async function approveWorkerProfile(id) {
  const { data } = await api.patch(`/api/worker-profiles/${id}/approve`, null, {
    headers: { "X-Reviewer-Id": reviewerId() },
  });
  return data;
}

export async function rejectWorkerProfile(id, reason) {
  const { data } = await api.patch(
    `/api/worker-profiles/${id}/reject`,
    { reason },
    { headers: { "X-Reviewer-Id": reviewerId() } }
  );
  return data;
}
