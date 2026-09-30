import { parseApiError } from "./apiError";
import axiosClient from "./axiosClient";

export async function registerWorker(payload,files) {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(payload)],{type:"application/json"}),
  );
  formData.append("cccdFront", files.cccdFront);
  formData.append("cccdBack", files.cccdBack);
  files.certificates.forEach((f) => formData.append("certificates",f));
  files.degrees.forEach((f) => formData.append("degrees",f));

  return axiosClient.post("/worker/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getMyProfile() {
  try {
    const data = await axiosClient.get("/worker/profile");
    return data;
  } catch (err) {
    if (parseApiError(err).code === "WORKER_PROFILE_NOT_FOUND") {
      return null;
    }
    throw err;
  }
}

export async function updateAvailability(available) {
  return await axiosClient.patch("/worker/availability",{available});
}
