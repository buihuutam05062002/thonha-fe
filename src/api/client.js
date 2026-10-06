const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function getAccessToken() {
    return localStorage.getItem('accessToken')
}

export function getRefreshToken() {
    return localStorage.getItem('refreshToken')
}

export function saveSession(d) {
    localStorage.setItem('accessToken', d.accessToken);
    localStorage.setItem('refreshToken', d.refreshToken);
    localStorage.setItem('user', JSON.stringify(d.user))
}

export function clearSession() {
    ['accessToken', 'refreshToken', 'user'].forEach(k => localStorage.removeItem(k))
}

export function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
        return null
    }
}

function authHeaders() {
    const t = getAccessToken();
    return t ? {Authorization: `Bearer ${t}`} : {}
}

async function parse(r) {
    if (r.ok) return r.status === 204 ? null : r.json();
    const b = await r.json().catch(() => null);
    const e = new Error(b?.message || 'Có lỗi xảy ra');
    e.status = r.status;
    e.errors = b?.errors;
    throw e
}

export async function register(data) {
    const r = await fetch(`${API}/api/v1/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            fullName: data.hoTen,
            email: data.email,
            phoneNumber: data.soDienThoai,
            password: data.matKhau
        })
    });
    const x = await parse(r);
    saveSession(x);
    return x
}

export async function login(data) {
    const r = await fetch(`${API}/api/v1/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({account: data.taiKhoan, password: data.matKhau})
    });
    const x = await parse(r);
    saveSession(x);
    return x
}

export async function refresh() {
    const t = getRefreshToken();
    if (!t) throw new Error('Phiên đăng nhập đã hết hạn');
    const r = await fetch(`${API}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refreshToken: t})
    });
    const x = await parse(r);
    saveSession(x);
    return x
}

export async function logout() {
    try {
        await fetch(`${API}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refreshToken: getRefreshToken()})
        })
    } finally {
        clearSession()
    }
}

export async function request(path, opt = {}, retry = true) {
    const r = await fetch(`${API}${path}`, {...opt, headers: {...authHeaders(), ...(opt.headers || {})}});
    if (r.status === 401 && retry && getRefreshToken()) {
        try {
            await refresh();
            return request(path, opt, false)
        } catch {
            clearSession()
        }
    }
    return parse(r)
}

export async function getMe() {
    const x = await request('/api/v1/users/me');
    return {...x, hoTen: x.fullName, anhDaiDien: x.avatarUrl, soDienThoai: x.phoneNumber, vaiTro: [...(x.roles || [])]}
}

export async function updateMe(data) {
    const x = await request('/api/v1/users/me', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({fullName: data.hoTen, avatarUrl: data.anhDaiDien, phoneNumber: data.soDienThoai})
    });
    const out = {...x, hoTen: x.fullName, anhDaiDien: x.avatarUrl, soDienThoai: x.phoneNumber};
    localStorage.setItem('user', JSON.stringify({...getStoredUser(), ...out}));
    return out
}

export async function getAddresses() {
    const xs = await request('/api/v1/addresses');
    return xs.map(x => ({...x, tenGoi: x.label, diaChi: x.fullAddress, macDinh: x.defaultAddress}))
}

export async function createAddress(data) {
    const x = await request('/api/v1/addresses', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            label: data.tenGoi,
            fullAddress: data.diaChi,
            lat: data.lat,
            lng: data.lng,
            defaultAddress: data.macDinh
        })
    });
    return {...x, tenGoi: x.label, diaChi: x.fullAddress, macDinh: x.defaultAddress}
}

export async function updateAddress(id, data) {
    const x = await request(`/api/v1/addresses/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            label: data.tenGoi,
            fullAddress: data.diaChi,
            lat: data.lat,
            lng: data.lng,
            defaultAddress: data.macDinh
        })
    });
    return {...x, tenGoi: x.label, diaChi: x.fullAddress, macDinh: x.defaultAddress}
}

export async function deleteAddress(id) {
    return request(`/api/v1/addresses/${id}`, {method: 'DELETE'})
}

export async function setDefaultAddress(id) {
    const x = await request(`/api/v1/addresses/${id}/default`, {method: 'PATCH'});
    return {...x, tenGoi: x.label, diaChi: x.fullAddress, macDinh: x.defaultAddress}
}

export async function getCategories() {
    const xs = await request('/api/v1/service-categories');
    return xs.map(x => ({...x, ten: x.name}))
}

function mapRequestStatus(s) {
    return ({
        PENDING: 'CHO_GHEP_THO',
        MATCHING: 'CHO_GHEP_THO',
        ASSIGNED: 'DA_GHEP',
        ON_THE_WAY: 'DANG_DI_CHUYEN',
        IN_PROGRESS: 'DANG_SUA',
        COMPLETED: 'HOAN_THANH',
        CANCELLED: 'DA_HUY'
    })[s] || s
}

export async function createRequest(data, files) {
    const form = new FormData();
    const payload = {
        categoryId: data.danhMucId,
        description: data.moTa,
        priorityLevel: data.mucDoUuTien === 'KHAN_CAP' ? 'URGENT' : 'NORMAL',
        addressId: data.diaChiId,
        addressText: data.diaChiSnapshot,
        lat: data.lat,
        lng: data.lng,
        desiredTime: data.loaiThoiGian === 'HEN_GIO' ? 'SCHEDULED' : 'IMMEDIATE',
        scheduledAt: data.thoiGianHen || null
    };
    form.append('data', new Blob([JSON.stringify(payload)], {type: 'application/json'}));
    (files || []).forEach(f => form.append('files', f));
    const x = await request('/api/v1/repair-requests', {method: 'POST', body: form});
    return {
        id: x.id,
        maYeuCau: x.requestCode,
        danhMuc: x.category,
        diaChi: x.addressText,
        trangThai: mapRequestStatus(x.status),
        dinhKemUrls: x.attachmentUrls
    }
}

export async function getMyRequests() {
    const xs = await request('/api/v1/repair-requests');
    return xs.map(x => ({
        ...x,
        maYeuCau: x.requestCode,
        danhMuc: x.category,
        diaChi: x.addressText,
        trangThai: mapRequestStatus(x.status),
        dinhKemUrls: x.attachmentUrls
    }))
}

export async function getRequestById(id) {
    const x = await request(`/api/v1/repair-requests/${id}`);
    return {
        ...x,
        maYeuCau: x.requestCode,
        danhMuc: x.category,
        diaChi: x.addressText,
        trangThai: mapRequestStatus(x.status),
        dinhKemUrls: x.attachmentUrls
    }
}

export async function autocompleteAddress(input) {
    const x = await request(`/api/v1/maps/autocomplete?input=${encodeURIComponent(input)}`);
    return (x.predictions || []).map(p => ({
        placeId: p.place_id,
        moTa: p.description,
        chinh: p.structured_formatting?.main_text || p.description,
        phu: p.structured_formatting?.secondary_text || ''
    }))
}

export async function getPlaceDetail(placeId) {
    const x = await request(`/api/v1/maps/place?placeId=${encodeURIComponent(placeId)}`);
    const loc = x.result?.geometry?.location;
    return {lat: loc?.lat ?? null, lng: loc?.lng ?? null}
}

export async function classifyIncident(description, files) {
    const form = new FormData();
    form.append('description', description || '');
    (files || []).forEach((f) => form.append('files', f));
    return request('/api/v1/ai/classify', {method: 'POST', body: form});
    // trả về: {categoryId, categoryName, confidence, reason}; categoryId = null nếu AI không chắc/không khả dụng
}

export async function getReview(requestId) {
    // 204 -> null (chưa đánh giá)
    return request(`/api/v1/repair-requests/${requestId}/review`);
}

export async function createReview(requestId, rating, comment) {
    return request(`/api/v1/repair-requests/${requestId}/review`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({rating, comment: comment || null})
    });
}

export async function getMyWorkerReviews(page = 0, size = 10) {
    return request(`/api/v1/worker/reviews?page=${page}&size=${size}`);
}