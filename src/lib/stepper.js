// Vị trí (tính theo %) của phần track/fill trong bộ chỉ báo bước ".stepper".
// Tính sẵn bằng JS thay vì CSS left/right cố định (vd 15px) để đường nối luôn khớp
// chính xác tâm vòng tròn đầu/cuối, dù có bao nhiêu bước hay khung rộng bao nhiêu.
// (Bài học từ lỗi cũ: 2 đoạn CSS .progress-step chồng nhau từng khiến đường nối lệch/đứt.)

// half: khoảng cách từ mép khung đến tâm vòng tròn đầu/cuối = nửa bề rộng một "cột".
function halfPercent(count) {
    return count > 0 ? 50 / count : 0;
}

export function stepperTrackStyle(count) {
    const half = halfPercent(count);
    return {left: `${half}%`, right: `${half}%`};
}

// doneIndex: số thứ tự (0-based) của bước/trạng thái hiện tại — phần đã hoàn thành
// trải dài từ tâm vòng tròn đầu tiên đến tâm vòng tròn thứ doneIndex + 1.
export function stepperFillStyle(count, doneIndex) {
    const half = halfPercent(count);
    const span = 100 - 2 * half;
    const ratio = count > 1 ? Math.max(0, Math.min(1, doneIndex / (count - 1))) : 0;
    return {left: `${half}%`, width: `${span * ratio}%`};
}
