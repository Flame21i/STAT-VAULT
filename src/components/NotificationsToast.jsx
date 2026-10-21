import React, { memo } from 'react';
import { X, AlertTriangle, AlertCircle, Bell, ArrowRight } from 'lucide-react';

/**
 * Floating notification toast stack for threshold triggers.
 * Clicking any notification immediately selects the target entity.
 */
const NotificationsToast = memo(({
  notifications = [],
  onSelectEntity,
  onDismiss,
  onClearAll,
}) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed top-14 right-6 z-[250] flex flex-col gap-2 max-w-sm w-full pointer-events-none font-mono">
      {/* Notifications stack */}
      {notifications.slice(0, 4).map(item => {
        const isMin = item.type === 'min';
        return (
          <div
            key={item.id}
            onClick={() => onSelectEntity?.(item.entityId)}
            className={`pointer-events-auto cursor-pointer rounded-xl p-3 border transition-all duration-200 ease-out shadow-2xl flex items-start gap-2.5 group animate-slide-in-down ${
              isMin
                ? 'bg-[#140808]/95 border-red-500/50 hover:border-red-400 text-red-200'
                : 'bg-[#141208]/95 border-yellow-500/50 hover:border-yellow-400 text-yellow-200'
            }`}
          >
            {/* Flashing dot animation */}
            <div className="pt-0.5 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isMin ? 'bg-red-400' : 'bg-yellow-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isMin ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.entityColor || '#fff' }}
                  />
                  <span className="text-[10px] font-black uppercase text-white truncate">
                    {item.entityName}
                  </span>
                  <span
                    className={`px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-wider ${
                      isMin ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {isMin ? 'MIN ALERT' : 'MAX ALERT'}
                  </span>
                </div>
                <span className="text-[7.5px] text-zinc-500 shrink-0 font-mono">
                  {item.timeStr}
                </span>
              </div>

              <p className="text-[8.5px] leading-tight text-zinc-300">
                <span className="font-bold uppercase text-white">{item.statName || 'Total Score'}</span>:{' '}
                <span className={`font-black ${isMin ? 'text-red-400' : 'text-yellow-400'}`}>
                  {item.value}
                </span>{' '}
                {isMin ? '< Min' : '> Max'} ({item.threshold})
              </p>

              <div className="flex items-center gap-1 mt-1 text-[7px] text-zinc-400 group-hover:text-white transition-colors">
                <span>Click to select entity</span>
                <ArrowRight size={8} />
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.(item.id);
              }}
              className="text-zinc-500 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors shrink-0"
              title="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      {notifications.length > 4 && (
        <div className="pointer-events-auto flex items-center justify-between px-3 py-1 bg-black/90 border border-white/10 rounded-lg text-[8px] text-zinc-400">
          <span>+{notifications.length - 4} more alerts</span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-rose-400 hover:text-rose-300 font-bold uppercase transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </aside>
  );
});

NotificationsToast.displayName = 'NotificationsToast';
export default NotificationsToast;
