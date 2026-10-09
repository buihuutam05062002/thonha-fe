import React, {useCallback, useEffect, useRef, useState} from "react";
import {Card} from "react-bootstrap";
import {createStompClient, fetchActiveJobs} from "../../../api/trackingApi";
import ChatBox from '../../../components/chat/ChatBox.jsx';

const STATUS_TEXT = {ASSIGNED: "Đã nhận đơn", ON_THE_WAY: "Đang di chuyển"};
const SIM_STEPS = 40;
const SIM_INTERVAL_MS = 2000;

export function ShareLocationCard() {
    const [jobs, setJobs] = useState([]);
    const [jobId, setJobId] = useState(null);
    const [mode, setMode] = useState("idle");
    const [info, setInfo] = useState("");
    const [error, setError] = useState("");

    const clientRef = useRef(null);
    const watchRef = useRef(null);
    const simRef = useRef(null);

    useEffect(() => {
        fetchActiveJobs()
            .then((list) => {
                setJobs(list);
                if (list.length > 0) setJobId(list[0].id);
            })
            .catch(() => setJobs([]));
    }, []);

    const stop = useCallback(() => {
        if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
        if (simRef.current) clearInterval(simRef.current);
        watchRef.current = null;
        simRef.current = null;
        clientRef.current?.deactivate();
        clientRef.current = null;
        setMode("idle");
    }, []);

    useEffect(() => stop, [stop]);

    const connect = () =>
        new Promise((resolve, reject) => {
            const client = createStompClient({
                onConnected: (c) => {
                    c.subscribe("/user/queue/errors", (m) => setError(m.body));
                    resolve(c);
                },
                onError: (msg) => reject(new Error(msg)),
            });
            clientRef.current = client;
            client.activate();
        });

    const send = (job, lat, lng, heading) => {
        const c = clientRef.current;
        if (!c?.connected) return;
        c.publish({
            destination: `/app/requests/${job.id}/location`,
            body: JSON.stringify({lat, lng, heading: heading ?? null}),
        });
    };

    const startGps = async (job) => {
        setError("");
        setInfo("");
        if (!navigator.geolocation) return setError("Trình duyệt không hỗ trợ định vị GPS.");
        try {
            await connect();
        } catch (e) {
            return setError(e.message || "Không kết nối được máy chủ.");
        }
        setMode("gps");
        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => send(job, pos.coords.latitude, pos.coords.longitude, pos.coords.heading),
            (e) => setError("Không lấy được vị trí GPS: " + e.message),
            {enableHighAccuracy: true, maximumAge: 2000, timeout: 10000},
        );
    };

    const startSim = async (job) => {
        setError("");
        setInfo("");
        try {
            await connect();
        } catch (e) {
            return setError(e.message || "Không kết nối được máy chủ.");
        }
        setMode("sim");
        const start = {lat: job.lat + 0.012, lng: job.lng + 0.012};
        let i = 0;
        simRef.current = setInterval(() => {
            i += 1;
            const k = i / SIM_STEPS;
            send(job, start.lat + (job.lat - start.lat) * k, start.lng + (job.lng - start.lng) * k, null);
            if (i >= SIM_STEPS) {
                stop();
                setInfo("Đã đến nơi (giả lập).");
            }
        }, SIM_INTERVAL_MS);
    };

    if (jobs.length === 0) return null;

    const job = jobs.find((j) => j.id === jobId) ?? jobs[0];
    const sharing = mode !== "idle";

    return (
        <>
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-4">
                    <h6 className="fw-bold mb-1 text-dark">Chia sẻ vị trí cho khách</h6>

                    {jobs.length > 1 ? (
                        <select
                            className="form-select form-select-sm my-2"
                            value={job.id}
                            disabled={sharing}
                            onChange={(e) => setJobId(Number(e.target.value))}
                        >
                            {jobs.map((j) => (
                                <option key={j.id} value={j.id}>{j.requestCode} · {j.category}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="small fw-semibold text-dark mt-1">{job.requestCode} · {job.category}</div>
                    )}
                    <div className="small text-muted mb-1">{job.addressText}</div>
                    <div className="small text-muted mb-3">Trạng thái: {STATUS_TEXT[job.status] ?? job.status}</div>

                    <div className="d-flex flex-wrap gap-2">
                        {!sharing ? (
                            <>
                                <button
                                    className="btn btn-sm fw-bold text-white"
                                    style={{backgroundColor: "#F5820D"}}
                                    onClick={() => startGps(job)}
                                >
                                    Chia sẻ GPS
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={job.lat == null || job.lng == null}
                                    onClick={() => startSim(job)}
                                >
                                    Giả lập di chuyển (demo)
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-sm btn-outline-danger" onClick={stop}>
                                Dừng chia sẻ
                            </button>
                        )}
                    </div>

                    {sharing && (
                        <p className="small text-success mb-0 mt-3">
                            {mode === "gps" ? "Đang chia sẻ vị trí GPS..." : "Đang giả lập di chuyển tới nhà khách..."}
                        </p>
                    )}
                    {info && <p className="small text-muted mb-0 mt-3">{info}</p>}
                    {error && <p className="small text-danger mb-0 mt-3">{error}</p>}
                </Card.Body>
            </Card>
            <ChatBox requestId={job.id}/>
        </>
    );
}