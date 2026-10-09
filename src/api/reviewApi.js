import axiosClient from "./axiosClient";

/** Đánh giá của yêu cầu; null nếu chưa có (BE trả 204). */
export async function getReview(requestId) {
  const review = await axiosClient.get(`/repair-requests/${requestId}/review`);
  return review || null;
}

export function createReview(requestId, rating, comment) {
  return axiosClient.post(`/repair-requests/${requestId}/review`, { rating, comment: comment || null });
}

/** Thợ xem các đánh giá về mình. */
export function getMyWorkerReviews(page = 0, size = 10) {
  return axiosClient.get("/worker/reviews", { params: { page, size } });
}
