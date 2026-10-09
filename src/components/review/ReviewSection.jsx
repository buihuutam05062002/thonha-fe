import {Star} from 'lucide-react';
import {useEffect, useState} from 'react';
import {createReview, getReview} from '../../api/reviewApi.js';

const HINTS = ['', 'Rất tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'];

function Stars({value, size = 28, onPick, onHover}) {
    return (
        <div style={{display: 'flex', gap: 6}} onMouseLeave={() => onHover && onHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => {
                const star = (
                    <Star size={size} aria-hidden="true"
                          fill={n <= value ? '#F5820D' : 'none'}
                          color={n <= value ? '#F5820D' : '#9CA3AF'}/>
                );
                return onPick ? (
                    <button key={n} type="button" aria-label={`${n} sao`}
                            style={{background: 'none', border: 0, padding: 0, cursor: 'pointer', lineHeight: 0}}
                            onMouseEnter={() => onHover && onHover(n)} onClick={() => onPick(n)}>
                        {star}
                    </button>
                ) : <span key={n} style={{lineHeight: 0}}>{star}</span>;
            })}
        </div>
    );
}

/** Hiện form đánh giá khi yêu cầu đã hoàn thành; nếu đã đánh giá thì hiện lại đánh giá đó. */
export default function ReviewSection({requestId}) {
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;
        getReview(requestId)
            .then((r) => alive && setReview(r))
            .catch(() => {})
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        };
    }, [requestId]);

    async function submit() {
        if (!rating) {
            setError('Vui lòng chọn số sao');
            return;
        }
        setSaving(true);
        setError('');
        try {
            setReview(await createReview(requestId, rating, comment));
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return null;

    if (review) {
        return (
            <div className="tracking-map-wrap">
                <p className="section-title"><span>Đánh giá của bạn</span></p>
                <Stars value={review.rating} size={22}/>
                {review.comment && <p style={{margin: '10px 0 0'}}>{review.comment}</p>}
                <p className="muted" style={{margin: '8px 0 0'}}>Cảm ơn bạn đã đánh giá!</p>
            </div>
        );
    }

    const shown = hover || rating;
    return (
        <div className="tracking-map-wrap">
            <p className="section-title"><span>Đánh giá thợ</span></p>
            <p className="muted" style={{margin: '0 0 10px'}}>Bạn hài lòng với dịch vụ lần này chứ?</p>
            <Stars value={shown} onPick={setRating} onHover={setHover}/>
            <p className="muted" style={{margin: '6px 0 10px', minHeight: 20}}>{HINTS[shown]}</p>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Nhận xét thêm về thợ (không bắt buộc)"
                style={{width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #D1D5DB', font: 'inherit'}}
            />
            <div className="muted" style={{textAlign: 'right', fontSize: 12}}>{comment.length}/1000</div>
            {error && <p className="error" role="alert">{error}</p>}
            <button type="button" className="btn primary small" style={{marginTop: 8}} onClick={submit} disabled={saving}>
                {saving ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
        </div>
    );
}