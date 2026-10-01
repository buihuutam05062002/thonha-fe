import axios from "axios";
import { API_BASE_URL } from "../user-management/userApi";

export const STATUSES = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
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

function mapProfile(p) {
  return {
    ...p,
    name: p.fullName || `Hồ sơ #${p.id}`,
    avatar: p.avatarUrl || "",
    phoneNumber: p.phoneNumber || "",
    serviceArea: p.operatingArea,
    residenceCity: p.provinceCity,
    yearsOfExperience: p.experienceYears,
    documents: (p.documents ?? []).map((d) => ({
      ...d,
      url: d.fileUrl,
    })),
  };
}

export async function fetchWorkerProfiles({
  status = "PENDING",
  keyword,
  city,
  page = 0,
  size = 10,
}) {
  const { data } = await api.get("/admin/worker-profiles", {
    params: {
      status: status || undefined,
      keyword: keyword?.trim() || undefined,
      city: city?.trim() || undefined,
      page,
      size,
    },
  });
  return {
    ...data,
    content: (data.content ?? []).map(mapProfile),
  };
}

export async function fetchWorkerProfileDetail(id) {
  const { data } = await api.get(`/admin/worker-profiles/${id}`);
  return mapProfile(data);
}

export async function approveWorkerProfile(id) {
  const { data } = await api.patch(`/admin/worker-profiles/${id}/approve`);
  return mapProfile(data);
}

export async function rejectWorkerProfile(id, reason) {
  const { data } = await api.patch(`/admin/worker-profiles/${id}/reject`, {
    reason,
  });
  return mapProfile(data);
}
