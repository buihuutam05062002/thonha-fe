import {useEffect, useState, useCallback, useRef} from 'react';
import {ArrowLeft, Home, LogOut, MapPin, Plus, Save, Trash2, UserCircle} from 'lucide-react';
import {
    autocompleteAddress,
    getPlaceDetail,
    createAddress,
    deleteAddress,
    getAddresses,
    getMe,
    logout,
    setDefaultAddress,
    updateMe
} from '../api/client.js';

const emptyAddress = {tenGoi: '', diaChi: '', lat: '', lng: '', macDinh: false};
export default function ProfilePage({onBack, onLoggedOut}) {
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [address, setAddress] = useState(emptyAddress);
    const [showAddress, setShowAddress] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef(null);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const [u, a] = await Promise.all([getMe(), getAddresses()]);
            setUser(u);
            setName(u.hoTen || '');
            setAvatar(u.anhDaiDien || '');
            setAddresses(a);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function save(e) {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const u = await updateMe({hoTen: name, anhDaiDien: avatar});
            setUser(u);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function addAddress(e) {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await createAddress({
                ...address,
                lat: address.lat ? Number(address.lat) : null,
                lng: address.lng ? Number(address.lng) : null
            });
            setAddress(emptyAddress);
            setShowAddress(false);
            setAddresses(await getAddresses());
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    function onAddressType(value) {
        setAddress((a) => ({...a, diaChi: value, lat: '', lng: ''}));
        clearTimeout(debounceRef.current);
        if (value.trim().length < 3) {
            setSuggestions([]);
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
        setAddress((a) => ({...a, diaChi: s.moTa}));
        try {
            const detail = await getPlaceDetail(s.placeId);
            setAddress((a) => ({...a, lat: detail.lat, lng: detail.lng}));
        } catch {
            setError('Không lấy được toạ độ, bạn thử chọn lại gợi ý khác');
        }
    }

    async function makeDefault(id) {
        try {
            await setDefaultAddress(id);
            setAddresses(await getAddresses());
        } catch (e) {
            setError(e.message);
        }
    }

    async function removeAddress(id) {
        if (!window.confirm('Xóa địa chỉ này?')) return;
        try {
            await deleteAddress(id);
            setAddresses(await getAddresses());
        } catch (e) {
            setError(e.message);
        }
    }

    async function signOut() {
        await logout();
        onLoggedOut();
    }

    if (loading) return <div className="page">
        <main className="shell">
            <div className="body"><p className="muted">Đang tải hồ sơ...</p></div>
        </main>
    </div>;
    return <div className="page">
        <main className="shell">
            <header className="topbar">
                <button className="icon-btn" onClick={onBack}><ArrowLeft/></button>
                <h1>Hồ sơ</h1></header>
            <div className="body profile-body">
                <div className="profile-head">
                    <div className="profile-avatar">{user?.anhDaiDien ? <img src={user.anhDaiDien} alt=""/> :
                        <UserCircle size={48}/>}</div>
                    <div><h2>{user?.hoTen}</h2><span className="role">Khách hàng</span></div>
                </div>
                <form onSubmit={save}><label className="label">Họ và tên<input className="input" value={name}
                                                                               onChange={e => setName(e.target.value)}
                                                                               required maxLength={100}/></label><label
                    className="label">Email<input className="input" value={user?.email || 'Chưa cập nhật'}
                                                  readOnly/></label><label className="label">Số điện thoại<input
                    className="input" value={user?.soDienThoai || 'Chưa cập nhật'} readOnly/></label><label
                    className="label">Ảnh đại diện (URL)<input className="input" value={avatar}
                                                               onChange={e => setAvatar(e.target.value)}
                                                               placeholder="https://..."/></label>{error &&
                    <div className="error">{error}</div>}
                    <button className="btn primary" disabled={saving}><Save
                        size={18}/>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                </form>
                <div className="section-title"><b>Địa chỉ đã lưu</b><span>{addresses.length} địa chỉ</span></div>
                <div className="address-list">{addresses.map(a => <div className="address-card" key={a.id}><span
                    className="address-icon">{a.macDinh ? <Home size={20}/> : <MapPin size={20}/>}</span>
                    <div className="address-main"><b>{a.tenGoi} {a.macDinh &&
                        <span className="default-badge">Mặc định</span>}</b><span>{a.diaChi}</span>
                        <div className="address-actions">{!a.macDinh &&
                            <button onClick={() => makeDefault(a.id)}>Đặt mặc định</button>}
                            <button onClick={() => removeAddress(a.id)}><Trash2 size={14}/> Xóa</button>
                        </div>
                    </div>
                </div>)}</div>
                {!showAddress ? <button className="btn secondary" onClick={() => {
                        setShowAddress(true);
                        setError('');
                    }}><Plus size={18}/>Thêm địa chỉ mới</button> :
                    <form className="address-form" onSubmit={addAddress}><h3>Thêm địa chỉ</h3><label className="label">Tên
                        gọi<input className="input" value={address.tenGoi}
                                  onChange={e => setAddress({...address, tenGoi: e.target.value})}
                                  placeholder="Nhà riêng" required/></label><label className="label">
                        Địa chỉ
                        <div style={{position: 'relative'}}>
                            <input
                                className="input"
                                value={address.diaChi}
                                onChange={(e) => onAddressType(e.target.value)}
                                onFocus={() => suggestions.length && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                placeholder="Số nhà, đường, phường/xã..."
                                autoComplete="off"
                                required
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="suggestions">
                                    {suggestions.map((s) => (
                                        <li key={s.placeId}>
                                            <button type="button" onMouseDown={() => pickSuggestion(s)}>
                                                <b>{s.chinh}</b>
                                                {s.phu && <span className="desc">{s.phu}</span>}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </label>
                        <label className="check"><input type="checkbox"
                                                        checked={address.macDinh}
                                                        onChange={e => setAddress({
                                                            ...address,
                                                            macDinh: e.target.checked
                                                        })}/> Đặt làm địa chỉ
                            mặc định</label>
                        <div className="inline-buttons">
                            <button type="button" className="btn secondary" onClick={() => setShowAddress(false)}>Hủy
                            </button>
                            <button className="btn primary" disabled={saving}>Lưu địa chỉ</button>
                        </div>
                    </form>}
                <div className="profile-divider"/>
                <button className="btn danger" onClick={signOut}><LogOut size={18}/>Đăng xuất</button>
            </div>
        </main>
    </div>;
}
