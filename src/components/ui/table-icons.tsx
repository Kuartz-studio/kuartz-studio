import React from 'react';

export function StatusIcon({ value }: { value: string }) {
  const s = 14;
  switch (value) {
    case "BACKLOG":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-label="Backlog" className="shrink-0">
          <circle cx="8" cy="8" r="6" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="3 2.5" fill="none" />
        </svg>
      );
    case "TODO":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-label="À faire" className="shrink-0">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35" />
        </svg>
      );
    case "IN_PROGRESS":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-label="En cours" className="shrink-0">
          <circle cx="8" cy="8" r="6" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
          <path d="M8 2a6 6 0 0 1 0 12V2z" fill="#3B82F6" />
        </svg>
      );
    case "IN_REVIEW":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-label="En revue" className="shrink-0">
          <circle cx="8" cy="8" r="6" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <path d="M8 2a6 6 0 0 1 0 12A6 6 0 0 1 2 8h6V2z" fill="#F59E0B" />
        </svg>
      );
    case "DONE":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-label="Terminé" className="shrink-0">
          <circle cx="8" cy="8" r="6" stroke="#10B981" strokeWidth="1.5" fill="none" />
          <path d="M5.5 8.5l1.8 1.8 3.2-3.6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "PAUSED":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-label="Pause" className="shrink-0">
          <circle cx="8" cy="8" r="6" stroke="#A855F7" strokeWidth="1.5" fill="none" />
          <rect x="5.5" y="5" width="1.8" height="6" rx="0.6" fill="#A855F7" />
          <rect x="8.7" y="5" width="1.8" height="6" rx="0.6" fill="#A855F7" />
        </svg>
      );
    case "CANCELED":
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-label="Annulé" className="shrink-0">
          <circle cx="8" cy="8" r="7" fill="#EF4444" />
          <path d="M5.75 5.75l4.5 4.5M10.25 5.75l-4.5 4.5" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" className="shrink-0">
          <circle cx="8" cy="8" r="6" stroke="#6B7280" strokeWidth="1.5" fill="none" />
        </svg>
      );
  }
}

export function PriorityIcon({ value }: { value: number }) {
  const color = ["#6B7280", "#94A3B8", "#3B82F6", "#F59E0B", "#EF4444"][value] ?? "#6B7280";

  if (value === 0) { 
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-label="No priority" className="shrink-0">
        <circle cx="2.5" cy="8" r="1.5" fill={color} />
        <circle cx="8" cy="8" r="1.5" fill={color} />
        <circle cx="13.5" cy="8" r="1.5" fill={color} />
      </svg>
    );
  }
  if (value === 4) { 
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-label="Urgent" className="shrink-0">
        <rect x="1" y="1" width="14" height="14" rx="3" fill={color} />
        <path d="M8 4.5v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.9" fill="white" />
      </svg>
    );
  }
  const filledBars = value; 
  const barHeights = [4, 8, 12];
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-label={["Low", "Medium", "High"][value - 1]} className="shrink-0">
      {barHeights.map((h, i) => (
        <rect key={i} x={1 + i * 5} y={16 - h - 1} width="3.5" height={h} rx="1" fill={i < filledBars ? color : "#374151"} opacity={i < filledBars ? 1 : 0.4} />
      ))}
    </svg>
  );
}

export function AvatarCustom({ name, avatarBase64, isMe }: { name: string | null; avatarBase64?: string | null; isMe?: boolean }) {
  const safeName = name || 'User';
  const inner = avatarBase64 ? (
    <img src={avatarBase64} alt={safeName} title={safeName} className="h-full w-full rounded-full object-cover shrink-0" />
  ) : (() => {
    let hash = 0;
    for (let i = 0; i < safeName.length; i++) hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return (
      <span className="inline-flex items-center justify-center h-full w-full rounded-full text-[10px] font-bold text-white shrink-0"
        style={{ backgroundColor: `hsl(${hue}, 55%, 50%)` }} title={safeName}>
        {safeName.charAt(0).toUpperCase()}
      </span>
    );
  })();

  return (
    <div 
      className="relative flex h-6 w-6 shrink-0 rounded-full select-none shadow-sm"
      title={isMe ? `${safeName} (Vous)` : safeName}
    >
      {inner}
      {isMe && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-[1.5px] border-background bg-[#205CFF] z-10" />
      )}
    </div>
  );
}
