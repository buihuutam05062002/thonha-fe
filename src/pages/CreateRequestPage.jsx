import {useCallback, useEffect, useRef, useState} from 'react';
import {
    ArrowLeft, Camera, Check, Droplet, Refrigerator, WashingMachine, Wind, Wrench, X, Zap,
} from 'lucide-react';
import {createRequest, getCategories, getAddresses} from '../api/client.js';
import {autocompleteAddress, getPlaceDetail} from "../api/client.js";
import RequestTrackingPage from './RequestTrackingPage.jsx';
import logoImg from '../assets/logo.png';

const ICONS = {
    zap: Zap,
    droplet: Droplet,
    wind: Wind,
    refrigerator: Refrigerator,
    'washing-machine': WashingMachine,
    wrench: Wrench,
};

// Giới hạn phía trình duyệt chỉ để báo sớm cho người dùng; server mới là nơi kiểm tra chính thức.
const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 30;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const TOTAL_STEPS = 5; // SRS mục 4: tạo yêu cầu không quá 5 bước
const STEP_LABELS = ['Dịch vụ', 'Sự cố', 'Địa chỉ', 'Thời gian', 'Xác nhận'];

const EMPTY_FORM = {
    danhMucId: null,
    moTa: '',
    mucDoUuTien: 'THUONG',
    diaChiId: null,
    diaChiSnapshot: '',
    lat: null,
    lng: null,
    loaiThoiGian: 'NGAY_LAP_TUC',
    thoiGianHen: '',
};

function localNowValue() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

function formatHen(value) {
    return new Date(value).toLocaleString('vi-VN', {dateStyle: 'medium', timeStyle: 'short'});
}

export default function CreateRequestPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(EMPTY_FORM);
    const [categories, setCategories] = useState([]);
    const [catState, setCatState] = useState('loading'); // loading | ready | error
    const [media, setMedia] = useState([]);
    const [mediaError, setMediaError] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const [suggestions, setSuggestions] = useState([]);
    // const [addressQuery, setAddressQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef(null);
    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(true);
    const [showOtherAddresses, setShowOtherAddresses] = useState(false);
    const selectedAddress =
        addresses.find((address) => address.id === form.diaChiId) ||
        addresses.find((address) => address.macDinh);

    const mediaRef = useRef(media);
    mediaRef.current = media;
    const idRef = useRef(0);

    const loadCategories = useCallback(() => {
        setCatState('loading');
        getCategories()
            .then((list) => {
                setCategories(list);
                setCatState('ready');
            })
            .catch(() => setCatState('error'));
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        let mounted = true;

        getAddresses()
            .then((list) => {
                if (!mounted) return;

                setAddresses(list);

                const defaultAddress = list.find((address) => address.macDinh);

                if (defaultAddress) {
                    setForm((f) => ({
                        ...f,
                        diaChiId: defaultAddress.id,
                        diaChiSnapshot: defaultAddress.diaChi,
                        lat: defaultAddress.lat,
                        lng: defaultAddress.lng,
                    }));
                }
            })
            .catch(() => {
                if (mounted) {
                    setError('Không tải được địa chỉ đã lưu');
                }
            })
            .finally(() => {
                if (mounted) {
                    setAddressLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    // Giải phóng các URL xem trước khi rời trang
    useEffect(() => () => mediaRef.current.forEach((m) => URL.revokeObjectURL(m.url)), []);

    // Người dùng đang sửa dữ liệu thì xoá thông báo lỗi cũ, tránh hiện lỗi đã hết đúng
    const setField = (name, value) => {
        setForm((f) => ({...f, [name]: value}));
        setError('');
    };

    function addFiles(fileList) {
        let images = media.filter((m) => !m.isVideo).length;
        let videos = media.filter((m) => m.isVideo).length;
        const accepted = [];
        const errs = new Set();
        for (const f of Array.from(fileList)) {
            if (!ALLOWED_TYPES.includes(f.type)) {
                errs.add('Chỉ nhận ảnh JPG, PNG, WEBP hoặc video MP4');
                continue;
            }
            const isVideo = f.type === 'video/mp4';
            if (isVideo) {
                if (videos >= MAX_VIDEOS) {
                    errs.add(`Chỉ được đính kèm tối đa ${MAX_VIDEOS} video`);
                    continue;
                }
                if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
                    errs.add(`Video tối đa ${MAX_VIDEO_MB} MB`);
                    continue;
                }
                videos += 1;
            } else {
                if (images >= MAX_IMAGES) {
                    errs.add(`Chỉ được đính kèm tối đa ${MAX_IMAGES} ảnh`);
                    continue;
                }
                if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
                    errs.add(`Mỗi ảnh tối đa ${MAX_IMAGE_MB} MB`);
                    continue;
                }
                images += 1;
            }
            idRef.current += 1;
            accepted.push({id: idRef.current, file: f, isVideo, url: URL.createObjectURL(f)});
        }
        setMedia((m) => [...m, ...accepted]);
        setMediaError([...errs].join('. '));
    }

    function removeMedia(id) {
        setMedia((list) => {
            const target = list.find((m) => m.id === id);
            if (target) URL.revokeObjectURL(target.url);
            return list.filter((m) => m.id !== id);
        });
        setMediaError('');
    }

    function validate(n) {
        if (n === 1 && !form.danhMucId) return 'Vui lòng chọn danh mục dịch vụ';
        if (n === 2 && form.moTa.trim().length < 10) return 'Mô tả cần ít nhất 10 ký tự để thợ hiểu sự cố';
        if (n === 3 && !form.diaChiSnapshot.trim()) return 'Vui lòng nhập địa chỉ cần sửa';
        if (n === 4 && form.loaiThoiGian === 'HEN_GIO') {
            if (!form.thoiGianHen) return 'Vui lòng chọn ngày giờ hẹn';
            if (new Date(form.thoiGianHen) <= new Date()) return 'Thời gian hẹn phải ở tương lai';
        }
        return '';
    }

    function next() {
        const e = validate(step);
        if (e) {
            setError(e);
            return;
        }
        setError('');
        setStep((s) => s + 1);
    }

    function back() {
        setError('');
        setStep((s) => Math.max(1, s - 1));
    }

    async function submit() {
        for (let n = 1; n <= 4; n += 1) {
            const e = validate(n);
            if (e) {
                setStep(n);
                setError(e);
                return;
            }
        }
        setSubmitting(true);
        setError('');
        try {
            const data = {
                danhMucId: form.danhMucId,
                moTa: form.moTa.trim(),
                mucDoUuTien: form.mucDoUuTien,
                diaChiId: null,
                diaChiSnapshot: form.diaChiSnapshot.trim(),
                lat: form.lat,
                lng: form.lng,
                loaiThoiGian: form.loaiThoiGian,
                thoiGianHen: form.loaiThoiGian === 'HEN_GIO' ? form.thoiGianHen : null,
            };
            const res = await createRequest(data, media.map((m) => m.file));
            setResult(res);
        } catch (e) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    function reset() {
        media.forEach((m) => URL.revokeObjectURL(m.url));
        setMedia([]);
        setMediaError('');
        setForm(EMPTY_FORM);
        setResult(null);
        setError('');
        setStep(1);
    }

    function onAddressType(value) {
        setField('diaChiId', null);
        setField('diaChiSnapshot', value);
        setField('lat', null);
        setField('lng', null);

        clearTimeout(debounceRef.current);

        if (value.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setSuggestions(await autocompleteAddress(value));
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            }
        }, 300);
    }

    async function pickSuggestion(s) {
        setShowSuggestions(false);
        setField('diaChiId', null);
        setField('diaChiSnapshot', s.moTa);
        try {
            const detail = await getPlaceDetail(s.placeId);
            setField('lat', detail.lat);
            setField('lng', detail.lng);
        } catch {
            setError('Không lấy được toạ độ, bạn thử chọn lại gợi ý khác');
        }
    }

    const category = categories.find((c) => c.id === form.danhMucId);

    if (result) {
        return <RequestTrackingPage requestId={result.id} onCreateAnother={reset}/>;
    }

    return (
        <div className="page">
            <main className="shell">
                <header className="topbar request-topbar">
                    <div className="request-topbar-left">
                        {step > 1 ? (
                            <button type="button" className="icon-btn" onClick={back} aria-label="Quay lại bước trước">
                                <ArrowLeft size={22} aria-hidden="true"/>
                            </button>
                        ) : (
                            <button type="button" className="icon-btn" onClick={() => { location.href = '/'; }} aria-label="Về trang chủ">
                                <ArrowLeft size={22} aria-hidden="true"/>
                            </button>
                        )}
                        <img src={logoImg} alt="Thợ Nhà" className="request-logo"/>
                        <div>
                            <h1>Tạo yêu cầu sửa chữa</h1>
                            <span>Hoàn thành vài bước để tìm người thợ phù hợp</span>
                        </div>
                    </div>
                    <div className="request-topbar-step">Bước <strong>{step}</strong>/{TOTAL_STEPS}</div>
                </header>

                <div className="progress request-progress" role="img" aria-label={`Bước ${step} trên ${TOTAL_STEPS}`}>
                    {STEP_LABELS.map((label, i) => (
                        <div key={label} className={`progress-step${i < step ? ' on' : ''}${i === step - 1 ? ' current' : ''}`}>
                            <span>{i + 1}</span>
                            <b>{label}</b>
                        </div>
                    ))}
                </div>
                <p className="step-no">Bước {step}/{TOTAL_STEPS} · {STEP_LABELS[step - 1]}</p>

                <div className="body">
                    {step === 1 && (
                        <section>
                            <h2>Thiết bị của bạn thuộc nhóm nào?</h2>
                            {catState === 'loading' && <p className="muted">Đang tải danh mục...</p>}
                            {catState === 'error' && (
                                <div className="notice">
                                    <p>Không tải được danh mục dịch vụ.</p>
                                    <button type="button" className="btn secondary small" onClick={loadCategories}>Thử
                                        lại
                                    </button>
                                </div>
                            )}
                            {catState === 'ready' && (
                                <div className="tiles" role="radiogroup" aria-label="Danh mục dịch vụ">
                                    {categories.map((c) => {
                                        const Icon = ICONS[c.icon] || Wrench;
                                        const selected = form.danhMucId === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                className={`tile${selected ? ' sel' : ''}`}
                                                onClick={() => setField('danhMucId', c.id)}
                                            >
                                                <span className="tile-icon"><Icon size={22} aria-hidden="true"/></span>
                                                <span>{c.ten}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {step === 2 && (
                        <section>
                            <h2>Mô tả sự cố</h2>
                            <label className="label" htmlFor="moTa">Bạn đang gặp vấn đề gì?</label>
                            <textarea
                                id="moTa"
                                className="input area"
                                rows={5}
                                maxLength={2000}
                                placeholder="Ví dụ: Điều hòa chạy nhưng không lạnh, dàn nóng có tiếng ồn..."
                                value={form.moTa}
                                onChange={(e) => setField('moTa', e.target.value)}
                            />
                            <p className="counter">{form.moTa.length}/2000</p>

                            <span className="label">Hình ảnh hoặc video (không bắt buộc)</span>
                            <div className="media-grid">
                                {media.map((m) => (
                                    <div className="thumb" key={m.id}>
                                        {m.isVideo
                                            ? <video src={m.url} muted preload="metadata"
                                                     aria-label={`Video ${m.file.name}`}/>
                                            : <img src={m.url} alt={`Ảnh ${m.file.name}`}/>}
                                        <button type="button" className="thumb-x" onClick={() => removeMedia(m.id)}
                                                aria-label={`Xoá ${m.file.name}`}>
                                            <X size={14} aria-hidden="true"/>
                                        </button>
                                    </div>
                                ))}
                                <label className="thumb add">
                                    <Camera size={22} aria-hidden="true"/>
                                    <span>Thêm</span>
                                    <input
                                        type="file"
                                        accept={ALLOWED_TYPES.join(',')}
                                        multiple
                                        onChange={(e) => {
                                            addFiles(e.target.files);
                                            e.target.value = '';
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="hint">Tối đa {MAX_IMAGES} ảnh (mỗi ảnh {MAX_IMAGE_MB} MB)
                                và {MAX_VIDEOS} video MP4 ({MAX_VIDEO_MB} MB).</p>
                            {mediaError && <p className="error" role="alert">{mediaError}</p>}

                            <span className="label">Mức độ</span>
                            <div className="chips" role="radiogroup" aria-label="Mức độ ưu tiên">
                                {[['THUONG', 'Thường'], ['KHAN_CAP', 'Khẩn cấp']].map(([v, l]) => (
                                    <button
                                        key={v}
                                        type="button"
                                        role="radio"
                                        aria-checked={form.mucDoUuTien === v}
                                        className={`chip${form.mucDoUuTien === v ? ' sel' : ''}`}
                                        onClick={() => setField('mucDoUuTien', v)}
                                    >{l}</button>
                                ))}
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section>
                            <h2>Địa chỉ cần sửa</h2>

                            {addressLoading ? (
                                <p className="hint">Đang tải địa chỉ đã lưu...</p>
                            ) : (
                                <>
                                    {selectedAddress && (
                                        <>
                                            <div className="saved-address-header">
                            <span className="label">
                                Địa chỉ đã lưu
                            </span>

                                                {addresses.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="saved-address-toggle"
                                                        onClick={() =>
                                                            setShowOtherAddresses(
                                                                (value) => !value
                                                            )
                                                        }
                                                    >
                                                        {showOtherAddresses
                                                            ? 'Thu gọn'
                                                            : 'Chọn địa chỉ khác'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Địa chỉ đang được chọn */}
                                            <button
                                                type="button"
                                                className={`address-card${
                                                    form.diaChiId === selectedAddress.id
                                                        ? ' sel'
                                                        : ''
                                                }`}
                                                onClick={() => {
                                                    setField(
                                                        'diaChiId',
                                                        selectedAddress.id
                                                    );
                                                    setField(
                                                        'diaChiSnapshot',
                                                        selectedAddress.diaChi
                                                    );
                                                    setField(
                                                        'lat',
                                                        selectedAddress.lat
                                                    );
                                                    setField(
                                                        'lng',
                                                        selectedAddress.lng
                                                    );

                                                    setSuggestions([]);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <div className="address-card-content">
                                                    <div className="address-card-title">
                                                        <strong>
                                                            {selectedAddress.tenGoi}
                                                        </strong>

                                                        {selectedAddress.macDinh && (
                                                            <span className="address-default">
                                                                Mặc định
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p>
                                                        {selectedAddress.diaChi}
                                                    </p>
                                                </div>

                                                {form.diaChiId === selectedAddress.id && (
                                                    <Check size={20} aria-hidden="true" />
                                                )}
                                            </button>

                                            {/* Các địa chỉ khác */}
                                            {showOtherAddresses && (
                                                <div className="address-list">
                                                    {addresses
                                                        .filter(
                                                            (address) =>
                                                                address.id !==
                                                                selectedAddress.id
                                                        )
                                                        .map((address) => (
                                                            <button
                                                                key={address.id}
                                                                type="button"
                                                                className="address-card"
                                                                onClick={() => {
                                                                    setField(
                                                                        'diaChiId',
                                                                        address.id
                                                                    );
                                                                    setField(
                                                                        'diaChiSnapshot',
                                                                        address.diaChi
                                                                    );
                                                                    setField(
                                                                        'lat',
                                                                        address.lat
                                                                    );
                                                                    setField(
                                                                        'lng',
                                                                        address.lng
                                                                    );

                                                                    setSuggestions([]);
                                                                    setShowSuggestions(false);

                                                                    // Chọn xong thì thu danh sách
                                                                    setShowOtherAddresses(false);
                                                                }}
                                                            >
                                                                <div className="address-card-content">
                                                                    <div className="address-card-title">
                                                                        <strong>
                                                                            {address.tenGoi}
                                                                        </strong>
                                                                    </div>

                                                                    <p>
                                                                        {address.diaChi}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <span className="label">
                                        Hoặc nhập địa chỉ khác
                                    </span>

                                    <div style={{position: 'relative'}}>
                                        <input
                                            id="diaChi"
                                            className="input"
                                            type="text"
                                            autoComplete="off"
                                            maxLength={255}
                                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                                            value={form.diaChiSnapshot}
                                            onChange={(e) =>
                                                onAddressType(e.target.value)
                                            }
                                            onFocus={() => {
                                                if (suggestions.length) {
                                                    setShowSuggestions(true);
                                                }
                                            }}
                                            onBlur={() => {
                                                setTimeout(
                                                    () =>
                                                        setShowSuggestions(false),
                                                    150
                                                );
                                            }}
                                        />

                                        {showSuggestions &&
                                            suggestions.length > 0 && (
                                                <ul className="suggestions">
                                                    {suggestions.map((s) => (
                                                        <li key={s.placeId}>
                                                            <button
                                                                type="button"
                                                                onMouseDown={() =>
                                                                    pickSuggestion(s)
                                                                }
                                                            >
                                                                <b>{s.chinh}</b>

                                                                {s.phu && (
                                                                    <span className="desc">
                                                                        {s.phu}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                    </div>

                                    {!form.lat &&
                                        form.diaChiSnapshot.trim() && (
                                            <p className="hint">
                                                Chưa chọn địa chỉ từ gợi ý nên hệ
                                                thống chưa có toạ độ chính xác.
                                            </p>
                                        )}
                                </>
                            )}
                        </section>
                    )}

                    {step === 4 && (
                        <section>
                            <h2>Bạn muốn thợ đến khi nào?</h2>
                            <div role="radiogroup" aria-label="Thời gian mong muốn">
                                {[
                                    ['NGAY_LAP_TUC', 'Ngay lập tức', 'Hệ thống tìm thợ gần nhất ngay bây giờ.'],
                                    ['HEN_GIO', 'Hẹn giờ cụ thể', 'Chọn ngày và giờ bạn tiện.'],
                                ].map(([v, title, desc]) => (
                                    <button
                                        key={v}
                                        type="button"
                                        role="radio"
                                        aria-checked={form.loaiThoiGian === v}
                                        className={`opt${form.loaiThoiGian === v ? ' sel' : ''}`}
                                        onClick={() => setField('loaiThoiGian', v)}
                                    >
                                        <span className="radio" aria-hidden="true"/>
                                        <span><b>{title}</b><span className="desc">{desc}</span></span>
                                    </button>
                                ))}
                            </div>
                            {form.loaiThoiGian === 'HEN_GIO' && (
                                <>
                                    <label className="label" htmlFor="hen">Ngày giờ hẹn</label>
                                    <input
                                        id="hen"
                                        className="input"
                                        type="datetime-local"
                                        min={localNowValue()}
                                        value={form.thoiGianHen}
                                        onChange={(e) => setField('thoiGianHen', e.target.value)}
                                    />
                                </>
                            )}
                        </section>
                    )}

                    {step === 5 && (
                        <section>
                            <h2>Kiểm tra lại yêu cầu</h2>
                            <dl className="summary">
                                <div>
                                    <dt>Thiết bị</dt>
                                    <dd>{category?.ten}</dd>
                                </div>
                                <div>
                                    <dt>Sự cố</dt>
                                    <dd>{form.moTa.trim()}</dd>
                                </div>
                                <div>
                                    <dt>Mức độ</dt>
                                    <dd>{form.mucDoUuTien === 'KHAN_CAP' ? 'Khẩn cấp' : 'Thường'}</dd>
                                </div>
                                <div>
                                    <dt>Đính kèm</dt>
                                    <dd>{media.length ? `${media.length} tệp` : 'Không có'}</dd>
                                </div>
                                <div>
                                    <dt>Địa chỉ</dt>
                                    <dd>{form.diaChiSnapshot.trim()}</dd>
                                </div>
                                <div>
                                    <dt>Thời gian</dt>
                                    <dd>{form.loaiThoiGian === 'HEN_GIO' ? formatHen(form.thoiGianHen) : 'Ngay lập tức'}</dd>
                                </div>
                            </dl>
                            <p className="hint">Bấm nút quay lại nếu cần sửa thông tin ở bước trước.</p>
                        </section>
                    )}

                    {error && <p className="error" role="alert">{error}</p>}
                </div>

                <div className="footer">
                    {step < TOTAL_STEPS ? (
                        <button type="button" className="btn primary" onClick={next}>Tiếp tục</button>
                    ) : (
                        <button type="button" className="btn primary" onClick={submit} disabled={submitting}>
                            {submitting ? 'Đang gửi...' : 'Tạo yêu cầu'}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}
