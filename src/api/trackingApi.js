import axiosClient from "./axiosClient";

export { createStompClient } from "./socket";

/** Khách/thợ của yêu cầu: trạng thái, thông tin thợ và vị trí gần nhất. */
export function fetchTracking(requestId) {
  return axiosClient.get(`/repair-requests/${requestId}/tracking`);
}

/** Thợ: các đơn đang thực hiện (đã ghép / đang di chuyển) để chia sẻ vị trí. */
export function fetchActiveJobs() {
  return axiosClient.get("/worker/jobs/active");
}
