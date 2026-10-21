import React from 'react';
import { AlertTriangle, Bell, ChevronRight, X } from 'lucide-react';

/**
 * Ephemeral toast & clickable threshold notification banner.
 * - Supports string messages or notification objects:
 *   { id, message, type: 'red' | 'yellow' | 'info', entityId, title }
 * - When entityId is provided, clicking the toast selects that entity.
 */
const Toast = ({ notification, onSelectEntity, onDismiss }) => {
  if (!notification) return null;

  const isObject = typeof notification === 'object';
  const message = isObject ? notification.message : notification;
  const type = isObject ? notification.type : 'info';
  const entityId = isObject ? notification.entityId : null;
  const title = isObject ? notification.title : null;

  const isRedAlert = type === 'red';
  const isYellowAlert = type === 'yellow';

  const handleClick = () => {
    if (entityId && onSelectEntity) {
      onSelectEntity(entityId);
      onDismiss?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[500] max-w-md px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-down select-none font-mono transition-all ${
        entityId ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${
        isRedAlert
          ? 'bg-[#180808] border-2 border-red-500 text-red-200 shadow-red-500/20'
          : isYellowAlert
            ? 'bg-[#181508] border-2 border-amber-400 text-amber-200 shadow-amber-400/20'
            : 'bg-[#121212] border border-white/20 text-white shadow-black/80'
      }`}
    >
      <div className="shrink-0">
        {isRedAlert ? (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        ) : isYellowAlert ? (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
          </span>
        ) : (
          <Bell size={13} className="text-rose-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[8px] font-black uppercase tracking-wider ${
              isRedAlert ? 'text-red-400' : isYellowAlert ? 'text-amber-400' : 'text-zinc-400'
            }`}>
              {title}
            </span>
          </div>
        )}
        <div className="text-[10px] font-bold tracking-tight truncate">
          {message}
        </div>
        {entityId && (
          <div className={`text-[7.5px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1 ${
            isRedAlert ? 'text-red-400/80' : isYellowAlert ? 'text-amber-300/80' : 'text-zinc-400'
          }`}>
            <span>Click to select entity</span>
            <ChevronRight size={10} />
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 rounded-md text-zinc-500 hover:text-white transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default Toast;
