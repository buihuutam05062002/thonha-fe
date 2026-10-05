import axiosClient from "./axiosClient";

/**
 * Service Category API
 * 
 * Backend endpoints:
 * - GET    /api/v1/service-categories
 * - POST   /api/v1/service-categories
 * - GET    /api/v1/service-categories/{id}
 * - PUT    /api/v1/service-categories/{id}
 * - DELETE /api/v1/service-categories/{id}
 */

/**
 * Get all active service categories
 * @returns {Promise<Array>} List of categories
 */
export async function getCategories() {
  return axiosClient.get("/service-categories");
}

// Alias for backward compatibility
export const getListServiceCategory = getCategories;

/**
 * Get category by ID
 * @param {number|string} id - Category ID
 * @returns {Promise<Object>} Category detail
 */
export async function getCategoryById(id) {
  return axiosClient.get(`/service-categories/${id}`);
}

/**
 * Create new category (admin only)
 * @param {Object} data - Category data
 * @param {string} data.name - Category name
 * @param {string} [data.description] - Description
 * @param {string} [data.icon] - Icon URL
 * @returns {Promise<Object>} Created category
 */
export async function createCategory({ name, description, icon }) {
  return axiosClient.post("/service-categories", { name, description, icon });
}

/**
 * Update category (admin only)
 * @param {number|string} id - Category ID
 * @param {Object} data - Category data
 * @param {string} [data.name] - Category name
 * @param {string} [data.description] - Description
 * @param {string} [data.icon] - Icon URL
 * @param {string} [data.status] - Status (ACTIVE/INACTIVE)
 * @returns {Promise<Object>} Updated category
 */
export async function updateCategory(id, { name, description, icon, status }) {
  return axiosClient.put(`/service-categories/${id}`, { name, description, icon, status });
}

/**
 * Delete category (admin only)
 * @param {number|string} id - Category ID
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
  return axiosClient.delete(`/service-categories/${id}`);
}