import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Pause, Play } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useStore } from '../../store/useStore';

const REFRESH_INTERVAL = 5 * 60; // 5 minutes in seconds

export default function AutoRefreshTimer() {
  const { colors, theme } = useTheme();
  const fetchDashboardData = useStore(s => s.fetchDashboardData);
  const dateRange = useStore(s => s.dateRange);
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL);
  const [paused, setPaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const doRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData(dateRange, true);
    } catch (e) {
      console.error('[AutoRefresh] Failed:', e);
    } finally {
      setIsRefreshing(false);
      setSecondsLeft(REFRESH_INTERVAL);
    }
  }, [fetchDashboardData, dateRange]);

  useEffect(() => {
    if (paused || isRefreshing) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          doRefresh();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [paused, isRefreshing, doRefresh]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((REFRESH_INTERVAL - secondsLeft) / REFRESH_INTERVAL) * 100;

  return (
    <div className="flex items-center gap-2">
      {/* Circular progress */}
      <div className="relative w-7 h-7">
        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="12" fill="none" stroke={theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'} strokeWidth="2" />
          <circle cx="14" cy="14" r="12" fill="none" stroke={colors.accent} strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 12}`}
            strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {isRefreshing ? (
          <RefreshCw size={10} className="absolute inset-0 m-auto animate-spin" style={{ color: colors.accent }} />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold" style={{ color: colors.textSecondary }}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Pause/play */}
      <button
        onClick={() => setPaused(p => !p)}
        className="p-1 rounded-md transition-all duration-200"
        style={{ color: colors.textTertiary }}
        onMouseEnter={e => { e.currentTarget.style.color = colors.text; e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = colors.textTertiary; e.currentTarget.style.background = 'transparent'; }}
        title={paused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
      </button>

      {/* Manual refresh */}
      <button
        onClick={doRefresh}
        disabled={isRefreshing}
        className="p-1 rounded-md transition-all duration-200"
        style={{ color: colors.textTertiary }}
        onMouseEnter={e => { if (!isRefreshing) { e.currentTarget.style.color = colors.accent; e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'; } }}
        onMouseLeave={e => { e.currentTarget.style.color = colors.textTertiary; e.currentTarget.style.background = 'transparent'; }}
        title="Refresh now"
      >
        <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
      </button>

      {paused && (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
          Paused
        </span>
      )}
    </div>
  );
}
