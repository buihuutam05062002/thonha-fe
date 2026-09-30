import axiosClient from "./axiosClient";

export async function getListServiceCategory() {
    const response = await axiosClient.get("/service-category");
    return response?.data ?? response;;
}