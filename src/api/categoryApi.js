import axiosClient from "./axiosClient";

export async function getListServiceCategory() {
  // Merged backend exposes GET /api/v1/service-categories
  // axiosClient already returns response.data.
  return await axiosClient.get("/service-categories");
}
