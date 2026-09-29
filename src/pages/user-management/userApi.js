import axios from "axios";

// Sửa lại URL backend cho đúng môi trường của bạn
export const API_BASE_URL = "http://localhost:8080";

// Ghi lại đúng giá trị Role.name trong DB của bạn
export const ROLES = [
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "EMPLOYEE", label: "Nhân viên" },
  { value: "WORKER", label: "Thợ" },
];

// Khớp với enum UserStatus ở backend
export const USER_STATUSES = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "LOCKED", label: "Bị khóa" },
  { value: "DELETED", label: "Đã xóa" },
];

const api = axios.create({ baseURL: API_BASE_URL });

// Tự gắn JWT vào mọi request (sửa lại nếu bạn lưu token ở chỗ khác)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gom lỗi về một message dễ hiển thị
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message ?? `Lỗi ${err.response?.status ?? "mạng"}: không thể tải dữ liệu`;
    return Promise.reject(new Error(msg));
  }
);

// page: bắt đầu từ 0 (đúng với Spring Pageable)
export async function fetchUsers({ keyword, role, userStatus, page = 0, size = 20 }) {
  const { data } = await api.get("/users", {
    params: {
      page,
      size,
      sort: "createdAt,desc",
      keyword: keyword?.trim() || undefined, // undefined thì axios bỏ qua param
      role: role || undefined,
      userStatus: userStatus || undefined,
    },
  });
  return data;
}

export async function fetchUserById(id) {
  const { data } = await api.get(`/users/${id}`);
  return data;
}

export async function updateUserStatus(id, userStatus) {
  const { data } = await api.patch(`/users/${id}/status`, null, {
    params: { userStatus },
  });
  return data;
}
