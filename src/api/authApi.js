import axiosClient from "./axiosClient";

/**
 * Authentication API
 * 
 * Backend endpoints:
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/refresh
 * - POST /api/v1/auth/logout
 * - GET  /api/v1/users/me
 * - PUT  /api/v1/users/me
 */

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.fullName - Full name
 * @param {string} data.email - Email (optional)
 * @param {string} data.phoneNumber - Phone number (optional)
 * @param {string} data.password - Password (min 6 chars)
 * @returns {Promise<Object>} Auth response with tokens and user
 */
export async function register({ fullName, email, phoneNumber, password }) {
  const response = await axiosClient.post("/auth/register", {
    fullName,
    email,
    phoneNumber,
    password,
  });
  return response;
}

/**
 * Login with email/phone and password
 * @param {Object} data - Login credentials
 * @param {string} data.account - Email or phone number
 * @param {string} data.password - Password
 * @returns {Promise<Object>} Auth response with tokens and user
 */
export async function login({ account, password }) {
  const response = await axiosClient.post("/auth/login", {
    account,
    password,
  });
  return response;
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<Object>} New auth response with tokens and user
 */
export async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const response = await axiosClient.post("/auth/refresh", { refreshToken });
  return response;
}

/**
 * Logout - revoke refresh token
 * @returns {Promise<void>}
 */
export async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    if (refreshToken) {
      await axiosClient.post("/auth/logout", { refreshToken });
    }
  } finally {
    clearSession();
  }
}

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile
 */
export async function getMe() {
  const response = await axiosClient.get("/users/me");
  return response;
}

/**
 * Update current user profile
 * @param {Object} data - Profile data
 * @param {string} data.fullName - Full name
 * @param {string} [data.avatarUrl] - Avatar URL
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateProfile({ fullName, avatarUrl }) {
  const response = await axiosClient.put("/users/me", { fullName, avatarUrl });
  return response;
}

/**
 * Save auth session to localStorage
 * @param {Object} authData - Auth response from backend
 */
export function saveSession(authData) {
  if (authData?.accessToken) localStorage.setItem("accessToken", authData.accessToken);
  if (authData?.refreshToken) localStorage.setItem("refreshToken", authData.refreshToken);
  if (authData?.user) localStorage.setItem("user", JSON.stringify(authData.user));
}

/**
 * Clear auth session from localStorage
 */
export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

/**
 * Get stored user from localStorage
 * @returns {Object|null} User object or null
 */
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

/**
 * Get access token from localStorage
 * @returns {string|null}
 */
export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem("accessToken");
}

/**
 * Get user roles from stored user
 * @returns {string[]}
 */
export function getUserRoles() {
  const user = getStoredUser();
  return user?.roles || [];
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export function hasRole(role) {
  return getUserRoles().includes(role);
}