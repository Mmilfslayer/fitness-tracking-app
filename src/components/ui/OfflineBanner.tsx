import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export function OfflineBanner() {
  const { isOnline, wasOffline, lastOnlineAt } = useOnlineStatus();

  if (isOnline && !wasOffline) {
    return null;
  }

  const dateString = lastOnlineAt
    ? format(lastOnlineAt, 'MMM d, yyyy')
    : 'recently';

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-amber-50 border-b border-amber-200 dark:bg-amber-900/30 dark:border-amber-800"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span>
            {isOnline
              ? `Back online – Last synced ${dateString}`
              : `Offline – Showing plan from ${dateString}`}
          </span>
        </div>
        {isOnline && wasOffline && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800 rounded-full"
          >
            Refresh
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}