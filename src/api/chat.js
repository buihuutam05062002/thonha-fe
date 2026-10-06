import {createStompClient} from './tracking.js';
import {getAccessToken} from './client.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function authHeaders() {
    const t = getAccessToken();
    return t ? {Authorization: `Bearer ${t}`} : {};
}

async function parse(r) {
    if (r.ok) return r.status === 204 ? null : r.json();
    const b = await r.json().catch(() => null);
    const e = new Error(b?.message || 'Có lỗi xảy ra');
    e.status = r.status;
    throw e;
}

/** limit: số tin mỗi lần; before: id tin cũ nhất đang có (để tải trang cũ hơn). Bỏ trống cả hai = tải toàn bộ. */
export function fetchHistory(requestId, {before, limit} = {}) {
    const qs = new URLSearchParams();
    if (limit != null) qs.set('limit', limit);
    if (before != null) qs.set('before', before);
    const q = qs.toString();
    return fetch(`${API}/api/v1/repair-requests/${requestId}/messages${q ? `?${q}` : ''}`, {headers: authHeaders()}).then(parse);
}

export function sendMessageRest(requestId, content) {
    return fetch(`${API}/api/v1/repair-requests/${requestId}/messages`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', ...authHeaders()},
        body: JSON.stringify({content}),
    }).then(parse);
}

export {createStompClient};