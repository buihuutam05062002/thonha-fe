export default function PendingTable({ profiles, loading, error, selectedId, onSelect }) {
  return (
    <div className="wa-table-wrap">
      <table className="wa-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Chuyên môn</th>
            <th>Khu vực</th>
            <th>Ngày đăng ký</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={4} className="wa-empty">Đang tải...</td></tr>}
          {!loading && error && <tr><td colSpan={4} className="wa-empty wa-error">{error}</td></tr>}
          {!loading && !error && profiles.length === 0 && (
            <tr><td colSpan={4} className="wa-empty">Không có hồ sơ nào</td></tr>
          )}
          {!loading && !error && profiles.map((p) => (
            <tr
              key={p.id}
              className={p.id === selectedId ? "active" : ""}
              onClick={() => onSelect(p.id)}
            >
              <td>{p.name}</td>
              <td>{p.specialtyText || "—"}</td>
              <td>{[p.residenceCity, p.serviceArea].filter(Boolean).join(" · ") || "—"}</td>
              <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
