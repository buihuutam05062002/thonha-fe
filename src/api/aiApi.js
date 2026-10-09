import axiosClient from "./axiosClient";

/**
 * AI gợi ý danh mục từ mô tả + ảnh.
 * Trả về {categoryId, categoryName, confidence, reason}; categoryId = null nếu AI không chắc/không khả dụng.
 */
export function classifyIncident(description, files = []) {
  const form = new FormData();
  form.append("description", description || "");
  files.forEach((f) => form.append("files", f));
  return axiosClient.post("/ai/classify", form, { headers: { "Content-Type": "multipart/form-data" } });
}
