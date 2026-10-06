import {Send} from 'lucide-react';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createStompClient, fetchHistory} from '../../api/chat.js';
import {getStoredUser} from '../../api/client.js';

const PAGE_SIZE = 30;

/** Gộp danh sách tin, bỏ trùng theo id, xếp cũ -> mới (tin realtime và tin tải từ lịch sử có thể trùng nhau). */
function mergeAsc(a, b) {
    const map = new Map();
    [...a, ...b].forEach((m) => map.set(m.id, m));
    return [...map.values()].sort((x, y) => x.id - y.id);
}

export default function ChatBox({requestId}) {
    const me = getStoredUser();
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [conn, setConn] = useState('connecting');
    const [hasMore, setHasMore] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [olderError, setOlderError] = useState('');
    const clientRef = useRef(null);
    const listRef = useRef(null);
    // Khác null khi vừa chèn tin cũ lên đầu: giữ nguyên vị trí cuộn thay vì nhảy xuống cuối.
    const prependHeightRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setMessages([]);
        setHasMore(false);
        setOlderError('');
        fetchHistory(requestId, {limit: PAGE_SIZE})
            .then((h) => {
                if (cancelled) return;
                setMessages((prev) => mergeAsc(h, prev));
                setHasMore(h.length >= PAGE_SIZE);
            })
            .catch(() => {});

        const client = createStompClient({
            onConnected: (c) => {
                setConn('live');
                c.subscribe(`/topic/requests/${requestId}/chat`, (frame) => {
                    const m = JSON.parse(frame.body);
                    setMessages((prev) => mergeAsc(prev, [m]));
                });
            },
            onClosed: () => setConn('offline'),
            onError: () => setConn('offline'),
        });
        client.activate();
        clientRef.current = client;
        return () => {
            cancelled = true;
            client.deactivate();
            clientRef.current = null;
        };
    }, [requestId]);

    useLayoutEffect(() => {
        const el = listRef.current;
        if (!el) return;
        if (prependHeightRef.current != null) {
            // Vừa tải tin cũ: bù phần chiều cao mới thêm để khung không bị giật.
            el.scrollTop += el.scrollHeight - prependHeightRef.current;
            prependHeightRef.current = null;
            return;
        }
        el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
    }, [messages]);

    async function loadOlder() {
        if (loadingOlder || messages.length === 0) return;
        setLoadingOlder(true);
        setOlderError('');
        try {
            const older = await fetchHistory(requestId, {before: messages[0].id, limit: PAGE_SIZE});
            prependHeightRef.current = listRef.current ? listRef.current.scrollHeight : 0;
            setMessages((prev) => mergeAsc(older, prev));
            setHasMore(older.length >= PAGE_SIZE);
        } catch {
            setOlderError('Không tải được tin nhắn cũ, bạn thử lại nhé.');
        } finally {
            setLoadingOlder(false);
        }
    }

    function send() {
        const content = draft.trim();
        if (!content || conn !== 'live') return;
        clientRef.current.publish({
            destination: `/app/requests/${requestId}/chat`,
            body: JSON.stringify({content}),
        });
        setDraft('');
    }

    return (
        <div style={{marginTop: 20}}>
            <p className="section-title"><span>Tin nhắn</span></p>
            <div ref={listRef} style={{
                height: 320, overflowY: 'auto', border: '1px solid #e3e7ee', borderRadius: 16,
                padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: '#fff',
            }}>
                {hasMore && (
                    <button type="button" className="btn secondary small" style={{alignSelf: 'center'}}
                            onClick={loadOlder} disabled={loadingOlder}>
                        {loadingOlder ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
                    </button>
                )}
                {olderError && <p className="error" role="alert" style={{textAlign: 'center', margin: 0}}>{olderError}</p>}
                {!hasMore && messages.length > 0 && (
                    <p className="muted" style={{textAlign: 'center', fontSize: 12, margin: 0}}>Đầu cuộc trò chuyện</p>
                )}
                {messages.map((m) => {
                    const mine = m.senderId === me?.id;
                    return (
                        <div key={m.id} style={{alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '75%'}}>
                            <div style={{
                                background: mine ? '#0a3760' : '#f1f3f6',
                                color: mine ? '#fff' : '#0a3760',
                                padding: '8px 12px', borderRadius: 14, fontSize: 14,
                            }}>
                                {m.content}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder={conn === 'live' ? 'Nhập tin nhắn...' : 'Đang kết nối...'}
                    disabled={conn !== 'live'}
                    style={{flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #e3e7ee'}}
                />
                <button onClick={send} disabled={conn !== 'live' || !draft.trim()}
                        style={{padding: '10px 16px', borderRadius: 12, background: '#ef8129', border: 0}}>
                    <Send size={18}/>
                </button>
            </div>
        </div>
    );
}