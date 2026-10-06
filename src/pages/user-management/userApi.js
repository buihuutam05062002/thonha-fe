import axiosClient, { API_BASE_URL } from "../../api/axiosClient";

export { API_BASE_URL };

export const ROLES = [
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "WORKER", label: "Thợ" },
  { value: "ADMIN", label: "Quản trị viên" },
];

export const USER_STATUSES = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "LOCKED", label: "Bị khóa" },
  { value: "DELETED", label: "Đã xóa" },
];

const toViewModel = (u) => ({ ...u, name: u.fullName, userStatus: u.status });

export async function fetchUsers({ keyword, role, userStatus, page = 0, size = 20 }) {
  // BE hiện chỉ có GET /admin/users phân trang, chưa có bộ lọc.
  // Lấy đủ dòng rồi lọc/phân trang phía client.
  // Endpoint này trả thẳng Page (không bọc ApiResponse) → axiosClient trả nguyên body.
  const data = await axiosClient.get("/admin/users", {
    params: { page: 0, size: 1000, sort: "id,desc" },
  });

  let content = (Array.isArray(data) ? data : data?.content ?? []).map(toViewModel);

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

// Lưu ý: BE chưa có GET /admin/users/{id}
export async function fetchUserById(id) {
  const data = await axiosClient.get(`/admin/users/${id}`);
  return toViewModel(data);
}

export async function updateUserStatus(id, userStatus) {
  const data = await axiosClient.patch(`/admin/users/${id}/status`, null, {
    params: { status: userStatus },
  });
  return toViewModel(data);
}
