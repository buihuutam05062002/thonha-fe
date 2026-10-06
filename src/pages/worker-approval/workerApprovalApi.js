import axiosClient from "../../api/axiosClient";

export const STATUSES = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
];

/**
 * WorkerProfileResponse (BE) → view model cho UI.
 * Lưu ý: BE hiện chưa trả fullName / phoneNumber / avatarUrl / createdAt trong
 * WorkerProfileResponse nên các field này sẽ rỗng cho tới khi BE bổ sung.
 */
function mapProfile(p) {
  const specialties = p.specialties ?? [];
  return {
    ...p,
    name: p.fullName || p.user?.fullName || `Hồ sơ #${p.id}`,
    avatar: p.avatarUrl || p.user?.avatarUrl || "",
    phoneNumber: p.phoneNumber || p.user?.phoneNumber || "",
    serviceArea: p.operatingArea,
    residenceCity: p.provinceCity,
    yearsOfExperience: p.experienceYears,
    specialtyText: specialties.map((s) => s.name).join(", "),
    documents: (p.documents ?? []).map((d) => ({ ...d, url: d.fileUrl })),
  };
}

export async function fetchWorkerProfiles({
  status = "PENDING",
  keyword,
  city,
  page = 0,
  size = 10,
}) {
  // Response: ApiResponse<Page<WorkerProfileResponse>> → axiosClient đã bóc sẵn `data` (= Page)
  const pageData = await axiosClient.get("/admin/worker-profiles", {
    params: {
      status: status || undefined,
      keyword: keyword?.trim() || undefined,
      city: city?.trim() || undefined,
      page,
      size,
    },
  });
  return {
    ...pageData,
    content: (pageData?.content ?? []).map(mapProfile),
  };
}

export async function fetchWorkerProfileDetail(id) {
  return mapProfile(await axiosClient.get(`/admin/worker-profiles/${id}`));
}

export async function approveWorkerProfile(id) {
  return mapProfile(await axiosClient.patch(`/admin/worker-profiles/${id}/approve`));
}

export async function rejectWorkerProfile(id, reason) {
  return mapProfile(
    await axiosClient.patch(`/admin/worker-profiles/${id}/reject`, { reason })
  );
}
