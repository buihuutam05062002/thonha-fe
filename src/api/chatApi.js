import axiosClient from "./axiosClient";

export { createStompClient } from "./socket";

/** limit: số tin mỗi lần; before: id tin cũ nhất đang có (tải trang cũ hơn). Bỏ trống cả hai = tải toàn bộ. */
export function fetchHistory(requestId, { before, limit } = {}) {
  return axiosClient.get(`/repair-requests/${requestId}/messages`, { params: { before, limit } });
}

export function sendMessageRest(requestId, content) {
  return axiosClient.post(`/repair-requests/${requestId}/messages`, { content });
}
