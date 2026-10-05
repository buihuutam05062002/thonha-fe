import axiosClient from "./axiosClient";

/**
 * Worker Profile API
 * 
 * Backend endpoints:
 * - POST   /api/v1/worker/profile (multipart/form-data)
 * - GET    /api/v1/worker/profile
 * - PATCH  /api/v1/worker/availability
 * 
 * Register payload (data part):
 * {
 *   provinceCity: string,
 *   operatingArea: string,
 *   experienceYears: number,
 *   categoryIds: number[],
 *   agreePolicy: boolean
 * }
 * Files: cccdFront, cccdBack, certificates[], degrees[]
 */

/**
 * Register worker profile
 * @param {Object} data - Worker profile data
 * @param {string} data.provinceCity - Province/City
 * @param {string} data.operatingArea - Operating area
 * @param {number} data.experienceYears - Years of experience
 * @param {number[]} data.categoryIds - Service category IDs
 * @param {boolean} [data.agreePolicy=true] - Agreement to policy
 * @param {Object} files - Required documents
 * @param {File} files.cccdFront - CCCD front image (required)
 * @param {File} files.cccdBack - CCCD back image (required)
 * @param {File[]} [files.certificates] - Certificate images
 * @param {File[]} [files.degrees] - Degree images
 * @returns {Promise<Object>} Created worker profile
 */
export async function registerWorkerProfile(data, files) {
  const formData = new FormData();
  
  const payload = {
    provinceCity: data.provinceCity,
    operatingArea: data.operatingArea,
    experienceYears: Number(data.experienceYears),
    categoryIds: data.categoryIds,
    agreePolicy: data.agreePolicy ?? true,
  };
  
  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  
  formData.append("cccdFront", files.cccdFront);
  formData.append("cccdBack", files.cccdBack);
  
  if (files.certificates?.length) {
    files.certificates.forEach((f) => formData.append("certificates", f));
  }
  if (files.degrees?.length) {
    files.degrees.forEach((f) => formData.append("degrees", f));
  }
  
  return axiosClient.post("/worker/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/**
 * Get current user's worker profile
 * @returns {Promise<Object|null>} Worker profile or null if not found
 */
export async function getMyWorkerProfile() {
  try {
    return await axiosClient.get("/worker/profile");
  } catch (error) {
    if (error.status === 404 || error.code === "WORKER_NOT_FOUND") {
      return null;
    }
    throw error;
  }
}

/**
 * Update worker availability status
 * @param {boolean} available - True for online/ready, false for offline
 * @returns {Promise<Object>} Updated worker profile
 */
export async function updateWorkerAvailability(available) {
  return axiosClient.patch("/worker/availability", { available });
}

// Alias for backward compatibility
export const registerWorker = registerWorkerProfile;