import {useCallback, useEffect, useRef, useState} from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';
import {createStompClient, fetchTracking} from '../../api/tracking.js';

const MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;
const MAP_STYLE = 'https://tiles.goong.io/assets/goong_map_web.json';
const MOVE_MS = 900;

function makeMarker(emoji, bg) {
    const el = document.createElement('div');
    Object.assign(el.style, {
        width: '40px', height: '40px', borderRadius: '50%', background: bg, border: '2px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        boxShadow: '0 2px 8px rgba(0,0,0,.3)',
    });
    el.textContent = emoji;
    return el;
}

const CONN_LABEL = {
    connecting: ['#c98a00', 'Đang kết nối...'],
    live: ['#1e9d62', 'Trực tiếp'],
    offline: ['#d64545', 'Mất kết nối, đang thử lại...'],
};

export default function TrackingMap({requestId, destLat, destLng}) {
    const boxRef = useRef(null);
    const mapRef = useRef(null);
    const workerRef = useRef(null);
    const posRef = useRef(null);
    const animRef = useRef(0);
    const fittedRef = useRef(false);
    const destRef = useRef({lat: destLat, lng: destLng});
    destRef.current = {lat: destLat, lng: destLng};

    const [info, setInfo] = useState(null);
    const [live, setLive] = useState(null);
    const [conn, setConn] = useState('connecting');

    useEffect(() => {
        if (!MAPTILES_KEY || !boxRef.current) return undefined;
        goongjs.accessToken = MAPTILES_KEY;
        const map = new goongjs.Map({
            container: boxRef.current,
            style: MAP_STYLE,
            center: [destLng, destLat],
            zoom: 14,
        });
        map.addControl(new goongjs.NavigationControl(), 'top-right');
        new goongjs.Marker({element: makeMarker('🏠', '#0a3760')}).setLngLat([destLng, destLat]).addTo(map);
        mapRef.current = map;
        return () => {
            cancelAnimationFrame(animRef.current);
            map.remove();
            mapRef.current = null;
            workerRef.current = null;
            posRef.current = null;
            fittedRef.current = false;
        };
    }, [destLat, destLng]);

    const moveWorker = useCallback((lat, lng) => {
        const map = mapRef.current;
        if (!map) return;
        if (!workerRef.current) {
            workerRef.current = new goongjs.Marker({element: makeMarker('🛵', '#ef8129')}).setLngLat([lng, lat]).addTo(map);
            posRef.current = {lat, lng};
        } else {
            const from = posRef.current || {lat, lng};
            const t0 = performance.now();
            cancelAnimationFrame(animRef.current);
            const step = (t) => {
                const k = Math.min(1, (t - t0) / MOVE_MS);
                const cur = {lat: from.lat + (lat - from.lat) * k, lng: from.lng + (lng - from.lng) * k};
                workerRef.current?.setLngLat([cur.lng, cur.lat]);
                posRef.current = cur;
                if (k < 1) animRef.current = requestAnimationFrame(step);
            };
            animRef.current = requestAnimationFrame(step);
        }
        if (!fittedRef.current) {
            const d = destRef.current;
            map.fitBounds(
                [[Math.min(lng, d.lng), Math.min(lat, d.lat)], [Math.max(lng, d.lng), Math.max(lat, d.lat)]],
                {padding: 70, maxZoom: 16, duration: 800}
            );
            fittedRef.current = true;
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetchTracking(requestId)
            .then((s) => {
                if (cancelled) return;
                setInfo(s);
                if (s.lastLocation) {
                    setLive(s.lastLocation);
                    moveWorker(s.lastLocation.lat, s.lastLocation.lng);
                }
            })
            .catch(() => {});

        const client = createStompClient({
            onConnected: (c) => {
                setConn('live');
                c.subscribe(`/topic/requests/${requestId}/location`, (msg) => {
                    const ev = JSON.parse(msg.body);
                    setLive(ev);
                    moveWorker(ev.lat, ev.lng);
                });
            },
            onClosed: () => setConn('offline'),
            onError: () => setConn('offline'),
        });
        client.activate();
        return () => {
            cancelled = true;
            client.deactivate();
        };
    }, [requestId, moveWorker]);

    const [dot, label] = CONN_LABEL[conn];
    const worker = info?.worker;

    return (
        <div style={{marginTop: 20}}>
            <p className="section-title"><span>Vị trí thợ</span></p>

            {MAPTILES_KEY ? (
                <div ref={boxRef}
                     style={{height: 300, borderRadius: 16, overflow: 'hidden', border: '1px solid #e3e7ee'}}/>
            ) : (
                <div className="notice">
                    <p>Chưa cấu hình bản đồ. Thêm <code>VITE_GOONG_MAPTILES_KEY</code> vào <code>frontend/.env</code> rồi chạy lại frontend.</p>
                </div>
            )}

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 8}}>
                <div>
                    {worker && <strong>{worker.name}</strong>}
                    {worker?.rating > 0 && <span className="muted"> · ★ {Number(worker.rating).toFixed(1)}</span>}
                    <div className="muted" style={{fontSize: 14}}>
                        {live
                            ? (live.etaMinutes === 0
                                ? 'Thợ sắp đến nơi'
                                : `Cách bạn ${(live.distanceMeters / 1000).toFixed(1)} km · khoảng ${live.etaMinutes} phút`)
                            : 'Thợ chưa xuất phát. Vị trí sẽ hiện ngay khi thợ bắt đầu di chuyển.'}
                    </div>
                </div>
                <span style={{fontSize: 13, color: dot, whiteSpace: 'nowrap'}}>● {label}</span>
            </div>
        </div>
    );
}