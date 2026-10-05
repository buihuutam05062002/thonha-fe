import {ArrowLeft, RefreshCw} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {getRepairRequestById} from '../api/repairRequestApi';

const STAGES = ['CHO_GHEP_THO', 'DA_GHEP', 'DANG_DI_CHUYEN', 'DANG_SUA', 'HOAN_THANH'];
const LABELS = {
    CHO_GHEP_THO: 'Chờ ghép thợ',
    DA_GHEP: 'Đã ghép thợ',
    DANG_DI_CHUYEN: 'Thợ đang di chuyển',
    DANG_SUA: 'Đang sửa chữa',
    HOAN_THANH: 'Hoàn thành',
    KHONG_TIM_THAY_THO: 'Không tìm thấy thợ',
    DA_HUY: 'Đã huỷ',
};
const BADGE_TONE = {
    CHO_GHEP_THO: 'wait',
    DA_GHEP: 'active',
    DANG_DI_CHUYEN: 'active',
    DANG_SUA: 'active',
    HOAN_THANH: 'done',
    KHONG_TIM_THAY_THO: 'bad',
    DA_HUY: 'bad',
};
const TERMINAL = ['HOAN_THANH', 'KHONG_TIM_THAY_THO', 'DA_HUY'];
const POLL_MS = 6000;

export default function RequestTrackingPage({requestId, onBack, onCreateAnother}) {
    const [yc, setYc] = useState(null);
    const [error, setError] = useState('');
    const timerRef = useRef(null);

    async function load(showSpinnerError = true) {
        try {
            const data = await getRepairRequestById(requestId);
            setYc(data);
            setError('');
            if (TERMINAL.includes(data.trangThai) && timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        } catch (e) {
            if (showSpinnerError) setError(e.message);
        }
    }

    useEffect(() => {
        load();
        timerRef.current = setInterval(() => load(false), POLL_MS);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestId]);

    if (error && !yc) {
        return (
            <div className="page">
                <main className="shell">
                    <div className="body">
                        <div className="notice">
                            <p>{error}</p>
                            <button type="button" className="btn secondary small" onClick={() => load()}>
                                Thử lại
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!yc) {
        return (
            <div className="page">
                <main className="shell">
                    <p className="muted" style={{margin: 'auto'}}>Đang tải...</p>
                </main>
            </div>
        );
    }

    const stageIndex = STAGES.indexOf(yc.trangThai);
    const isTerminalBad = yc.trangThai === 'KHONG_TIM_THAY_THO' || yc.trangThai === 'DA_HUY';

    return (
        <div className="page">
            <main className="shell">
                <header className="topbar">
                    {onBack ? (
                        <button type="button" className="icon-btn" onClick={onBack} aria-label="Quay lại">
                            <ArrowLeft size={22} aria-hidden="true"/>
                        </button>
                    ) : <span className="icon-spacer"/>}
                    <h1>Yêu cầu {yc.maYeuCau}</h1>
                </header>

                <div className="body">
                    <span className={`status-badge ${BADGE_TONE[yc.trangThai]}`}>{LABELS[yc.trangThai]}</span>
                    <h2 style={{margin: '10px 0 2px'}}>{yc.danhMuc}</h2>
                    <p className="muted" style={{margin: 0}}>{yc.diaChi}</p>

                    {isTerminalBad ? (
                        <div className="notice">
                            <p>
                                {yc.trangThai === 'KHONG_TIM_THAY_THO'
                                    ? 'Hiện chưa có thợ nào sẵn sàng gần bạn. Bạn có thể thử tạo lại yêu cầu sau ít phút.'
                                    : 'Yêu cầu này đã được huỷ.'}
                            </p>
                        </div>
                    ) : (
                        <ol className="timeline" aria-label="Tiến trình yêu cầu">
                            {STAGES.map((s, i) => (
                                <li key={s} className={i < stageIndex ? 'done' : i === stageIndex ? 'current' : ''}>
                                    {LABELS[s]}
                                </li>
                            ))}
                        </ol>
                    )}

                    {yc.dinhKemUrls?.length > 0 && (
                        <>
                            <p className="section-title" style={{marginTop: 20}}><span>Hình ảnh đã gửi</span></p>
                            <div className="media-grid">
                                {yc.dinhKemUrls.map((url) => (
                                    <div className="thumb" key={url}>
                                        <img src={url} alt="Ảnh sự cố đã gửi"/>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {!TERMINAL.includes(yc.trangThai) && (
                        <button type="button" className="btn secondary small" style={{marginTop: 20}}
                                onClick={() => load()}>
                            <RefreshCw size={16} aria-hidden="true" style={{marginRight: 6}}/>
                            Cập nhật ngay
                        </button>
                    )}
                </div>

                <div className="footer">
                    <button type="button" className="btn primary" onClick={onCreateAnother}>Tạo yêu cầu khác</button>
                </div>
            </main>
        </div>
    );
}