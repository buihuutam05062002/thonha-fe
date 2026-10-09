export function formatDateTime(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("vi-VN", { hour12: false });
}

/** "5 phút trước", "3 giờ trước", "2 ngày trước"... Hồ sơ cũ không có ngày nộp thì trả "—". */
export function formatRelative(v) {
  if (!v) return "—";
  const diff = Date.now() - new Date(v).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ngày trước`;
  return new Date(v).toLocaleDateString("vi-VN");
}
