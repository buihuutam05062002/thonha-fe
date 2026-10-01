import axiosClient from "./axiosClient";
import { parseApiError } from "./apiError";

export async function registerWorker(payload, files) {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify({
      ...payload,
      experienceYears: Number(payload.experienceYears),
      agreePolicy: payload.agreePolicy ?? true,
    })], { type: "application/json" }),
  );
  formData.append("cccdFront", files.cccdFront);
  formData.append("cccdBack", files.cccdBack);
  files.certificates.forEach((f) => formData.append("certificates", f));
  files.degrees.forEach((f) => formData.append("degrees", f));

  return axiosClient.post("/worker/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getMyProfile() {
  try {
    return await axiosClient.get("/worker/profile");
  } catch (err) {
    if (parseApiError(err).code === "WORKER_PROFILE_NOT_FOUND" ||
        err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function updateAvailability(available) {
  return axiosClient.patch("/worker/availability", { available });
}
