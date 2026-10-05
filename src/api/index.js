/**
 * Unified API exports for Thonha FE
 * 
 * Usage:
 * import { authApi, categoryApi, addressApi, repairRequestApi, workerApi } from '@/api';
 * 
 * Or individually:
 * import { login, register } from '@/api/authApi';
 */

export * as authApi from "./authApi";
export * as categoryApi from "./categoryApi";
export * as addressApi from "./addressApi";
export * as repairRequestApi from "./repairRequestApi";
export * as workerApi from "./workerApi";
export { default as axiosClient } from "./axiosClient";
export { parseApiError } from "./apiError";