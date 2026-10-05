import axiosClient from "./axiosClient";

/**
 * Repair Request API
 * 
 * Backend endpoints:
 * - POST   /api/v1/repair-requests (multipart/form-data)
 * - GET    /api/v1/repair-requests
 * - GET    /api/v1/repair-requests/{id}
 * - DELETE /api/v1/repair-requests/{id} (cancel)
 * 
 * Request payload (data part):
 * {
 *   categoryId: number,
 *   description: string,
 *   priorityLevel: "NORMAL" | "URGENT",
 *   addressId?: number,
 *   addressText?: string,
 *   lat?: number,
 *   lng?: number,
 *   desiredTime: "ASAP" | "SCHEDULED",
 *   scheduledAt?: string (ISO datetime)
 * }
 */

/**
 * Create a new repair request with optional file attachments
 * @param {Object} data - Repair request data
 * @param {number} data.categoryId - Service category ID
 * @param {string} data.description - Description of the issue
 * @param {"NORMAL"|"URGENT"} data.priorityLevel - Priority level
 * @param {number} [data.addressId] - Address ID (optional if addressText provided)
 * @param {string} [data.addressText] - Address text (optional if addressId provided)
 * @param {number} [data.lat] - Latitude
 * @param {number} [data.lng] - Longitude
 * @param {"ASAP"|"SCHEDULED"} data.desiredTime - Service timing
 * @param {string} [data.scheduledAt] - Scheduled datetime (ISO string) if desiredTime is SCHEDULED
 * @param {File[]} [files] - Array of image/video files
 * @returns {Promise<Object>} Created repair request
 */
export async function createRepairRequest(data, files = []) {
  const formData = new FormData();
  
  const payload = {
    categoryId: data.categoryId,
    description: data.description,
    priorityLevel: data.priorityLevel,
    addressId: data.addressId,
    addressText: data.addressText,
    lat: data.lat,
    lng: data.lng,
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
  
  return axiosClient.post("/repair-requests", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/**
 * Get current user's repair requests
 * @returns {Promise<Array>} List of repair requests
 */
export async function getMyRepairRequests() {
  return axiosClient.get("/repair-requests");
}

/**
 * Get repair request detail by ID
 * @param {number|string} id - Repair request ID
 * @returns {Promise<Object>} Repair request detail
 */
export async function getRepairRequestById(id) {
  return axiosClient.get(`/repair-requests/${id}`);
}

/**
 * Cancel repair request
 * @param {number|string} id - Repair request ID
 * @returns {Promise<Object>} Cancelled repair request
 */
export async function cancelRepairRequest(id) {
  return axiosClient.delete(`/repair-requests/${id}`);
}

/**
 * Map backend status to frontend display status
 * @param {string} status - Backend status
 * @returns {string} Frontend status key
 */
export function mapRequestStatus(status) {
  const statusMap = {
    PENDING_MATCH: "CHO_GHEP_THO",
    MATCHED: "DA_GHEP",
    ON_THE_WAY: "DANG_DI_CHUYEN",
    IN_PROGRESS: "DANG_SUA",
    COMPLETED: "HOAN_THANH",
    NOT_FOUND: "KHONG_TIM_THAY_THO",
    CANCELLED: "DA_HUY",
  };
  return statusMap[status] || status;
}

/**
 * Transform backend repair request to frontend format
 * @param {Object} request - Backend repair request
 * @returns {Object} Frontend formatted request
 */
export function transformRequest(request) {
  return {
    id: request.id,
    maYeuCau: request.requestCode,
    danhMuc: request.categoryName || request.category?.name,
    diaChi: request.addressText,
    trangThai: mapRequestStatus(request.status),
    dinhKemUrls: request.attachments?.map(a => a.url) || request.attachmentUrls,
    ...request,
  };
}