import axiosClient from "./axiosClient";

/**
 * Repair Request API
 *
 * Backend endpoints:
 * - POST   /api/v1/repair-requests            (multipart/form-data: part "data" + "files")
 * - GET    /api/v1/repair-requests
 * - GET    /api/v1/repair-requests/{id}
 * - PATCH  /api/v1/repair-requests/{id}/cancel
 *
 * Payload (part "data"):
 * {
 *   categoryId: number,
 *   description: string,
 *   priorityLevel: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
 *   addressId?: number,
 *   addressText: string,
 *   lat?: number,
 *   lng?: number,
 *   desiredTime: "ASAP" | "SCHEDULED",
 *   scheduledAt?: string (ISO local datetime)
 * }
 *
 * Mọi hàm đọc dữ liệu đều trả về object đã qua transformRequest()
 * (có thêm maYeuCau, danhMuc, diaChi, trangThai, dinhKemUrls cho UI).
 */

const LEGACY_PRIORITY = { NORMAL: "MEDIUM" };

export async function createRepairRequest(data, files = []) {
  const formData = new FormData();

  const payload = {
    categoryId: data.categoryId,
    description: data.description,
    priorityLevel: LEGACY_PRIORITY[data.priorityLevel] ?? data.priorityLevel,
    addressId: data.addressId ?? null,
    addressText: data.addressText,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    desiredTime: data.desiredTime,
    scheduledAt: data.scheduledAt || null,
  };

  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  files.forEach((file) => {
    if (file) formData.append("files", file);
  });

  const created = await axiosClient.post("/repair-requests", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return transformRequest(created);
}

/** Danh sách yêu cầu của người dùng hiện tại */
export async function getMyRepairRequests() {
  const list = await axiosClient.get("/repair-requests");
  return (list ?? []).map(transformRequest);
}

/** Chi tiết một yêu cầu */
export async function getRepairRequestById(id) {
  const request = await axiosClient.get(`/repair-requests/${id}`);
  return transformRequest(request);
}

/** Huỷ yêu cầu (BE: PATCH /{id}/cancel — không phải DELETE) */
export async function cancelRepairRequest(id) {
  const request = await axiosClient.patch(`/repair-requests/${id}/cancel`);
  return transformRequest(request);
}

/** Map RepairStatus của BE → key hiển thị ở FE */
export function mapRequestStatus(status) {
  const statusMap = {
    PENDING_MATCH: "CHO_GHEP_THO",
    MATCHING: "DANG_GHEP_THO",
    MATCHED: "DA_GHEP",
    ON_THE_WAY: "DANG_DI_CHUYEN",
    IN_PROGRESS: "DANG_SUA",
    COMPLETED: "HOAN_THANH",
    NOT_FOUND: "KHONG_TIM_THAY_THO",
    CANCELLED: "DA_HUY",
  };
  return statusMap[status] || status;
}

/** RepairRequestResponse (BE) → object dùng cho UI */
export function transformRequest(request) {
  if (!request) return request;
  return {
    ...request,
    maYeuCau: request.requestCode,
    danhMuc: request.categoryName ?? request.category?.name,
    diaChi: request.addressText ?? request.address?.fullAddress,
    trangThai: mapRequestStatus(request.status),
    dinhKemUrls: (request.attachments ?? []).map((a) => a.url).filter(Boolean),
  };
}
