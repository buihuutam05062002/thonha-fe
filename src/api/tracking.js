import {Client} from '@stomp/stompjs';
import {getAccessToken, refresh, request} from './client.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_URL = API.replace(/^http/, 'ws') + '/ws';

function expiresSoon(token, marginSec = 30) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.exp * 1000 - Date.now() < marginSec * 1000;
    } catch {
        return true;
    }
}

export function createStompClient({onConnected, onClosed, onError} = {}) {
    const client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 3000,
        beforeConnect: async () => {
            let token = getAccessToken();
            if (!token || expiresSoon(token)) {
                try {
                    await refresh();
                } catch {
                    // để server từ chối, giao diện sẽ báo mất kết nối
                }
                token = getAccessToken();
            }
            client.connectHeaders = {Authorization: `Bearer ${token}`};
        },
        onConnect: () => onConnected?.(client),
        onWebSocketClose: () => onClosed?.(),
        onStompError: (frame) => onError?.(frame.headers?.message || 'Lỗi WebSocket'),
    });
    return client;
}

export function fetchTracking(requestId) {
    return request(`/api/v1/repair-requests/${requestId}/tracking`);
}

export function fetchActiveJobs() {
    return request('/api/v1/worker/jobs/active');
}