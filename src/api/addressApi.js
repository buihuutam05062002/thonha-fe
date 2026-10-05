import axiosClient from "./axiosClient";

/**
 * Address API
 * 
 * Backend endpoints:
 * - GET    /api/v1/addresses
 * - POST   /api/v1/addresses
 * - PUT    /api/v1/addresses/{id}
 * - DELETE /api/v1/addresses/{id}
 * - PATCH  /api/v1/addresses/{id}/default
 */

/**
 * Get all addresses for current user
 * @returns {Promise<Array>} List of addresses
 */
export async function getAddresses() {
  return axiosClient.get("/addresses");
}

/**
 * Create new address
 * @param {Object} data - Address data
 * @param {string} data.label - Address label (e.g., "Nhà riêng", "Công ty")
 * @param {string} data.fullAddress - Full address text
 * @param {number} [data.lat] - Latitude
 * @param {number} [data.lng] - Longitude
 * @param {boolean} [data.defaultAddress=false] - Set as default
 * @returns {Promise<Object>} Created address
 */
export async function createAddress({ label, fullAddress, lat, lng, defaultAddress = false }) {
  return axiosClient.post("/addresses", { label, fullAddress, lat, lng, defaultAddress });
}

/**
 * Update address
 * @param {number|string} id - Address ID
 * @param {Object} data - Address data
 * @param {string} [data.label] - Address label
 * @param {string} [data.fullAddress] - Full address text
 * @param {number} [data.lat] - Latitude
 * @param {number} [data.lng] - Longitude
 * @param {boolean} [data.defaultAddress] - Set as default
 * @returns {Promise<Object>} Updated address
 */
export async function updateAddress(id, { label, fullAddress, lat, lng, defaultAddress }) {
  return axiosClient.put(`/addresses/${id}`, { label, fullAddress, lat, lng, defaultAddress });
}

/**
 * Delete address
 * @param {number|string} id - Address ID
 * @returns {Promise<void>}
 */
export async function deleteAddress(id) {
  return axiosClient.delete(`/addresses/${id}`);
}

/**
 * Set address as default
 * @param {number|string} id - Address ID
 * @returns {Promise<Object>} Updated address
 */
export async function setDefaultAddress(id) {
  return axiosClient.patch(`/addresses/${id}/default`);
}