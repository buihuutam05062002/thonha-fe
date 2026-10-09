const nf = new Intl.NumberFormat("vi-VN");

/** 850000 -> "850.000đ" */
export const formatMoney = (v) => `${nf.format(Math.round(Number(v) || 0))}đ`;

/** Rút gọn cho ô thống kê: 850000 -> "850K", 1250000 -> "1,25M" */
export function formatMoneyShort(v) {
  const n = Number(v) || 0;
  if (n >= 1_000_000) return `${nf.format(Math.round(n / 10_000) / 100)}M`;
  if (n >= 1_000) return `${nf.format(Math.round(n / 1_000))}K`;
  return String(n);
}

export function formatRelative(v) {
  if (!v) return "";
  const min = Math.floor((Date.now() - new Date(v).getTime()) / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return new Date(v).toLocaleDateString("vi-VN");
}

export function formatDayTime(v) {
  if (!v) return "";
  const d = new Date(v);
  const now = new Date();
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const yesterday = new Date(now.getTime() - 86400000);
  if (sameDay(d, now)) return `${time} - Hôm nay`;
  if (sameDay(d, yesterday)) return `${time} - Hôm qua`;
  return `${time} - ${d.toLocaleDateString("vi-VN")}`;
}
