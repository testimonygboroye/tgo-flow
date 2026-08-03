import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { listReviewsRequest } from '../services/review.service';

const OWNER_EMAIL = 'testimonygboroye.dev@gmail.com';
const WHATSAPP_LINK = 'https://wa.me/message/LUJ6PXE3ISDZF1';
const PHONE_NUMBER = '+2348152987294';
const GITHUB_URL = 'https://github.com/testimonygboroye';
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61590906354276';
const INSTAGRAM_URL = 'https://www.instagram.com/testimonygboroye?igsh=MXU0dmxraXRwN2lnbw==';

export function FloatingBrandButton() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: listReviewsRequest,
    enabled: user?.email === OWNER_EMAIL,
    refetchInterval: 20000,
  });

  const unreadCount = user?.email === OWNER_EMAIL ? (reviews || []).filter((r) => !r.isRead).length : 0;
  const dragStartRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, moved: false });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.moved = true;
    }
    setPosition({
      x: Math.max(4, dragStartRef.current.origX - dx),
      y: Math.max(4, dragStartRef.current.origY - dy),
    });
  }

  function handlePointerUp() {
    setDragging(false);
    if (!dragStartRef.current.moved) {
      setIsOpen((v) => !v);
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{ right: position.x, bottom: position.y }}
    >
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 rounded-xl border border-border bg-surface p-2 shadow-2xl">
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            TGO DevStudio
          </p>

          <button
            onClick={() => { setIsOpen(false); navigate('/feedback'); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
          >
            💬 Send Feedback
          </button>

          {user?.email === OWNER_EMAIL && (
            <>
              <button
                onClick={() => { setIsOpen(false); navigate('/messages'); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
              >
                📥 Messages
              </button>
              <button
                onClick={() => { setIsOpen(false); navigate('/analytics'); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
              >
                📊 User Analytics
              </button>
            </>
          )}

          <div className="my-1.5 border-t border-border" />

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
          >
            📱 WhatsApp the founder
          </a>

          <a
            href={`tel:${PHONE_NUMBER}`}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
          >
            📞 Call the founder
          </a>

          <div className="my-1.5 border-t border-border" />

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
          >
            🐙 GitHub
          </a>

          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
          >
            📘 Facebook
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
          >
            📷 Instagram
          </a>
        </div>
      )}

      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex h-14 w-14 touch-none items-center justify-center rounded-full bg-brand-gradient text-2xl text-white shadow-xl transition active:scale-95"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        aria-label="TGO DevStudio brand menu"
      >
        {unreadCount > 0 && (
          <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75" />
        )}
        {unreadCount > 0 ? (
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-base font-extrabold text-red-600 shadow-inner">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : (
          <span className="relative">✦</span>
        )}
      </button>
    </div>
  );
}
