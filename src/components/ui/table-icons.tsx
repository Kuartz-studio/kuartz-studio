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

export function ProjectIcon({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" stroke="none" className={className} role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M7.331 1.07a3.2 3.2 0 0 1 1.338 0c.498.106.967.377 1.904.917l1.354.78c.937.541 1.406.812 1.747 1.19.301.334.53.728.669 1.156.157.484.157 1.025.157 2.107v1.56l-.003.718c-.007.63-.036 1.026-.154 1.389l-.057.158a3.2 3.2 0 0 1-.612.998l-.135.138c-.33.312-.792.578-1.612 1.051l-1.354.78-.623.357c-.55.309-.907.481-1.281.56l-.166.032a3.2 3.2 0 0 1-1.006 0l-.166-.031c-.374-.08-.73-.252-1.281-.561l-.623-.356-1.354-.78c-.82-.474-1.281-.74-1.612-1.052l-.135-.138a3.2 3.2 0 0 1-.612-.998l-.057-.158c-.118-.363-.147-.758-.154-1.39L1.5 8.78V7.22c0-.946 0-1.479.105-1.921l.052-.186c.122-.374.312-.723.56-1.028l.11-.128c.255-.284.583-.507 1.126-.83l.62-.36 1.354-.78c.82-.473 1.281-.739 1.718-.869zM3 7.22v1.56c0 1.183.018 1.439.084 1.643l.064.167q.11.246.292.449l.059.06c.151.143.427.318 1.323.835l1.354.78.632.36c.188.104.33.178.442.233V8.482l-4.247-1.93zm5.75 1.262v4.826c.212-.106.533-.282 1.074-.594l1.354-.78.628-.368c.499-.297.646-.407.754-.527l.113-.14q.158-.218.243-.476l.022-.081c.035-.144.051-.351.058-.835L13 8.78V7.22l-.004-.668zM7.82 2.51l-.177.027c-.159.034-.328.106-.835.39l-.632.359-1.354.78c-.896.517-1.172.692-1.323.834l-.059.06q-.046.051-.086.104l4.645 2.112 4.645-2.112-.084-.103c-.109-.12-.255-.23-.754-.528l-.628-.367-1.354-.78c-.897-.517-1.186-.668-1.386-.728l-.08-.021a1.7 1.7 0 0 0-.538-.027" clipRule="evenodd"></path>
    </svg>
  );
}

export function UserIcon({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" stroke="none" className={className} role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.25 6.75C10.25 7.99264 9.24264 9 8 9C6.75736 9 5.75 7.99264 5.75 6.75C5.75 5.50736 6.75736 4.5 8 4.5C9.24264 4.5 10.25 5.50736 10.25 6.75Z"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M8.5752 10C9.97242 10 11.2611 10.6106 12.1436 11.6143C12.1563 11.5997 12.17 11.586 12.1826 11.5713C12.4518 11.2567 12.9255 11.2202 13.2402 11.4893C13.5548 11.7585 13.5913 12.2321 13.3223 12.5469C13.0953 12.8123 12.8478 13.0593 12.584 13.2881C12.5484 13.3246 12.5106 13.3593 12.4668 13.3887C11.3913 14.2811 10.0437 14.8571 8.56738 14.9756C8.56118 14.9762 8.55508 14.978 8.54883 14.9785C8.51409 14.9812 8.4792 14.9822 8.44434 14.9844C8.38882 14.9879 8.3332 14.991 8.27734 14.9932C8.18529 14.9968 8.09287 15 8 15C7.90681 15 7.81406 14.9968 7.72168 14.9932C7.66583 14.991 7.6102 14.9879 7.55469 14.9844C7.52015 14.9822 7.48558 14.9812 7.45117 14.9785C7.44459 14.978 7.43816 14.9763 7.43164 14.9756C5.94988 14.8564 4.59683 14.2772 3.51953 13.3789C3.50616 13.3677 3.49384 13.3556 3.48145 13.3438C3.47213 13.3365 3.46218 13.33 3.45312 13.3223C3.17492 13.0844 2.91561 12.8251 2.67773 12.5469C2.40865 12.2321 2.44515 11.7585 2.75977 11.4893C3.07452 11.2202 3.54818 11.2567 3.81738 11.5713C3.83028 11.5864 3.84339 11.6013 3.85645 11.6162C4.73898 10.612 6.02721 10.0001 7.4248 10H8.5752ZM7.4248 11.5C6.47086 11.5001 5.59107 11.9168 4.9873 12.6016C5.85267 13.1696 6.88689 13.5 8 13.5C9.11327 13.5 10.1472 13.1687 11.0127 12.6006C10.4088 11.9164 9.52878 11.5 8.5752 11.5H7.4248Z"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M1.82715 6.76172C2.24007 6.79385 2.54868 7.15444 2.5166 7.56738C2.50553 7.70999 2.5 7.85427 2.5 8C2.5 8.14573 2.50553 8.29001 2.5166 8.43262C2.54868 8.84556 2.24007 9.20615 1.82715 9.23828C1.41418 9.27036 1.05357 8.9618 1.02148 8.54883C1.00741 8.36759 1 8.18457 1 8C1 7.81543 1.00741 7.63241 1.02148 7.45117C1.05357 7.0382 1.41418 6.72964 1.82715 6.76172Z"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M14.1729 6.76172C14.5858 6.72964 14.9464 7.0382 14.9785 7.45117C14.9926 7.63241 15 7.81543 15 8C15 8.18457 14.9926 8.36759 14.9785 8.54883C14.9464 8.9618 14.5858 9.27036 14.1729 9.23828C13.7599 9.20615 13.4513 8.84556 13.4834 8.43262C13.4945 8.29001 13.5 8.14573 13.5 8C13.5 7.85427 13.4945 7.70999 13.4834 7.56738C13.4513 7.15444 13.7599 6.79385 14.1729 6.76172Z"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M3.45312 2.67773C3.76789 2.40865 4.24155 2.44515 4.51074 2.75977C4.77982 3.07452 4.74329 3.54818 4.42871 3.81738C4.20954 4.00475 4.00475 4.20954 3.81738 4.42871C3.54818 4.74329 3.07452 4.77982 2.75977 4.51074C2.44515 4.24155 2.40865 3.76789 2.67773 3.45312C2.91561 3.17492 3.17492 2.91561 3.45312 2.67773Z"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.4893 2.75977C11.7585 2.44515 12.2321 2.40865 12.5469 2.67773C12.8251 2.91561 13.0844 3.17492 13.3223 3.45312C13.5913 3.76789 13.5548 4.24155 13.2402 4.51074C12.9255 4.77982 12.4518 4.74329 12.1826 4.42871C11.9953 4.20954 11.7905 4.00475 11.5713 3.81738C11.2567 3.54818 11.2202 3.07452 11.4893 2.75977Z"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1C8.18457 1 8.36759 1.00741 8.54883 1.02148C8.9618 1.05357 9.27036 1.41418 9.23828 1.82715C9.20615 2.24007 8.84556 2.54868 8.43262 2.5166C8.29001 2.50553 8.14573 2.5 8 2.5C7.85427 2.5 7.70999 2.50553 7.56738 2.5166C7.15444 2.54868 6.79385 2.24007 6.76172 1.82715C6.72964 1.41418 7.0382 1.05357 7.45117 1.02148C7.63241 1.00741 7.81543 1 8 1Z"></path>
    </svg>
  );
}

export function TaskIcon({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" stroke="none" className={className} role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.2458 10C14.6255 10 14.9393 10.2822 14.9889 10.6482L14.9958 10.75V12.2475C14.9958 13.7083 13.8567 14.9034 12.4177 14.9922L12.2504 14.9975L10.7513 15C10.3371 15.0007 10.0007 14.6655 10 14.2513C9.99936 13.8716 10.281 13.5573 10.647 13.507L10.7487 13.5L12.2479 13.4975C12.8943 13.4964 13.4255 13.0047 13.4893 12.3751L13.4958 12.2475V10.75C13.4958 10.3358 13.8316 10 14.2458 10ZM1.75 10C2.16421 10 2.5 10.3358 2.5 10.75V12.2475C2.5 12.937 3.05836 13.4963 3.74789 13.4975L5.24703 13.5C5.66125 13.5007 5.99646 13.8371 5.99576 14.2513C5.99506 14.6655 5.65871 15.0007 5.2445 15L3.74535 14.9975C2.22839 14.9949 1 13.7644 1 12.2475V10.75C1 10.3358 1.33579 10 1.75 10ZM8 6C9.10457 6 10 6.89543 10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6ZM10.7513 1L12.2504 1.00254C13.7674 1.0051 14.9958 2.23556 14.9958 3.75253V5.25C14.9958 5.66422 14.66 6 14.2458 6C13.8316 6 13.4958 5.66422 13.4958 5.25V3.75253C13.4958 3.063 12.9374 2.5037 12.2479 2.50253L10.7487 2.5C10.3345 2.4993 9.9993 2.16295 10 1.74873C10.0007 1.33452 10.3371 0.999302 10.7513 1ZM5.24873 1C5.66295 0.999303 5.9993 1.33452 6 1.74873C6.0007 2.16295 5.66548 2.4993 5.25127 2.5L3.75212 2.50253C3.06259 2.5037 2.50424 3.063 2.50424 3.75253V5.25C2.50424 5.66422 2.16845 6 1.75424 6C1.34002 6 1.00424 5.66422 1.00424 5.25V3.75253C1.00424 2.23556 2.23262 1.0051 3.74959 1.00254L5.24873 1Z"></path>
    </svg>
  );
}

export function DocumentsIcon({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" stroke="none" className={className} role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.836 3A1.836 1.836 0 0 0 3 4.836v7.328c0 .9.646 1.647 1.5 1.805V7.836A3.336 3.336 0 0 1 7.836 4.5h6.133A1.84 1.84 0 0 0 12.164 3zM1.5 12.164a3.337 3.337 0 0 0 3.015 3.32A3.337 3.337 0 0 0 7.836 18.5h3.968c.73 0 1.43-.29 1.945-.805l3.946-3.946a2.75 2.75 0 0 0 .805-1.945V7.836a3.337 3.337 0 0 0-3.015-3.32A3.337 3.337 0 0 0 12.164 1.5H4.836A3.336 3.336 0 0 0 1.5 4.836zM7.836 6A1.836 1.836 0 0 0 6 7.836v7.328C6 16.178 6.822 17 7.836 17H11.5v-4a1.5 1.5 0 0 1 1.5-1.5h4V7.836A1.836 1.836 0 0 0 15.164 6zm8.486 7H13v3.322z"></path>
    </svg>
  );
}
