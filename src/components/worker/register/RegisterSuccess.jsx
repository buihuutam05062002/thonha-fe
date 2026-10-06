import React from "react";

export function RegisterSuccess({ profile, onDong }) {
  const status = profile?.approvalStatus || "PENDING";

  return (
    <div className="py-16 text-center flex flex-col items-center gap-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "#F5820D" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M6 14l6 6 10-12"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Đăng ký thành công!</h2>

      <p className="text-sm text-gray-500 max-w-xs">
        {status === "PENDING" ? (
          <>
            Hồ sơ của bạn đang chờ duyệt. Chúng tôi sẽ xem xét và mở quyền nhận
            việc trong vòng 1–2 ngày làm việc.
          </>
        ) : status === "APPROVED" ? (
          <>Hồ sơ của bạn đã được duyệt. Bạn có thể bắt đầu nhận việc ngay.</>
        ) : (
          <>
            Hồ sơ của bạn chưa được duyệt. Vui lòng liên hệ hỗ trợ để biết thêm
            chi tiết.
          </>
        )}
      </p>

      <button
        onClick={onDong}
        className="mt-2 text-sm font-semibold underline text-gray-400 hover:text-gray-700 transition-colors"
      >
        Quay lại
      </button>
    </div>
  );
}
