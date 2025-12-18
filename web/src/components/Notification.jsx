import { useState, useEffect, useCallback } from "react";

export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

const TYPE_STYLES = {
  success: {
    bg: "bg-emerald-900/80",
    border: "border-emerald-700",
    text: "text-emerald-300",
    bar: "bg-emerald-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bg: "bg-red-900/80",
    border: "border-red-700",
    text: "text-red-300",
    bar: "bg-red-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-amber-900/80",
    border: "border-amber-700",
    text: "text-amber-300",
    bar: "bg-amber-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
          1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.347
          16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  },
  info: {
    bg: "bg-blue-900/80",
    border: "border-blue-700",
    text: "text-blue-300",
    bar: "bg-blue-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const POSITIONS = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

export default function Notification({
  message,
  title,
  type = NOTIFICATION_TYPES.INFO,
  duration = 5000,
  position = "top-right",
  onClose,
  showCloseButton = true,
  icon,
}) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [hover, setHover] = useState(false);

  const styles = TYPE_STYLES[type];

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (!duration || hover) return;

    const step = 100 / (duration / 50);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(timer);
          close();
          return 0;
        }
        return p - step;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [duration, hover, close]);

  if (!visible) return null;

  return (
    <div
      className={`fixed ${POSITIONS[position]} z-50 max-w-sm w-full animate-slide-in`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`${styles.bg} backdrop-blur-sm border ${styles.border}
        rounded-xl shadow-2xl overflow-hidden transition-all hover:scale-[1.02]`}>

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="h-1 bg-gray-800">
            <div className={`h-full ${styles.bar}`} style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="p-4 flex items-start">
          <div className={`p-2 rounded-lg ${styles.bg} mr-3`}>
            {icon || styles.icon}
          </div>

          <div className="flex-1">
            {title && <h3 className={`font-semibold text-sm ${styles.text}`}>{title}</h3>}
            <p className="text-sm text-gray-200">{message}</p>
          </div>

          {showCloseButton && (
            <button onClick={close} className="ml-2 text-gray-400 hover:text-white">
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}