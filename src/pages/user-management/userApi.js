import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const ROLES = [
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "EMPLOYEE", label: "Nhân viên" },
  { value: "WORKER", label: "Thợ" },
];

export const USER_STATUSES = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "LOCKED", label: "Bị khóa" },
  { value: "DELETED", label: "Đã xóa" },
];

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.message ??
      `Lỗi ${err.response?.status ?? "mạng"}: không thể tải dữ liệu`;
    return Promise.reject(new Error(msg));
  }
);

export async function fetchUsers({ keyword, role, userStatus, page = 0, size = 20 }) {
  // Backend merge currently exposes a paged admin user list without filters.
  // Fetch enough rows, then apply Tam's existing UI filters/pagination client-side.
  const { data } = await api.get("/admin/users", {
    params: { page: 0, size: 1000, sort: "id,desc" },
  });

  let content = (data.content ?? []).map((u) => ({
    ...u,
    name: u.fullName,
    userStatus: u.status,
  }));

  if (keyword?.trim()) {
    const q = keyword.trim().toLowerCase();
    content = content.filter((u) =>
      [u.fullName, u.email, u.phoneNumber].some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }
  if (role) content = content.filter((u) => (u.roles ?? []).includes(role));
  if (userStatus) content = content.filter((u) => u.status === userStatus);

  const totalPages = Math.ceil(content.length / size);
  const start = page * size;
  return { content: content.slice(start, start + size), totalPages };
}

export async function fetchUserById(id) {
  const { data } = await api.get(`/admin/users/${id}`);
  return { ...data, name: data.fullName, userStatus: data.status };
}

export async function updateUserStatus(id, userStatus) {
  const { data } = await api.patch(`/admin/users/${id}/status`, null, {
    params: { status: userStatus },
  });
  return { ...data, name: data.fullName, userStatus: data.status };
}
