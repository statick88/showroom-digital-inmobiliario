import { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw, Cloud, CheckCircle } from "lucide-react";
import { useOnlineStatus } from "@/presentation/hooks/useOnlineStatus";
import { OfflineQueue } from "@/presentation/lib/offline-queue";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updatePendingCount = async () => {
    try {
      const count = await OfflineQueue.getPendingCount();
      setPendingCount(count);
    } catch {
      // Silently fail - offline queue might not be available
    }
  };

  useEffect(() => {
    updatePendingCount();
    // Update every 5 seconds when online
    const interval = isOnline ? setInterval(updatePendingCount, 5000) : undefined;
    return () => clearInterval(interval);
  }, [isOnline]);

  // If online and no pending mutations, show nothing
  if (isOnline && pendingCount === 0) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // The actual flush happens in providers.tsx via online event listener
      // This just triggers a count refresh
      await updatePendingCount();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      data-testid="offline-indicator"
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
        isOnline
          ? "bg-green-600 text-white"
          : "bg-orange-600 text-white"
      }`}
    >
      {/* Status icon */}
      {isOnline ? (
        <>
          {isSyncing ? (
            <RefreshCw
              data-testid="syncing-icon"
              className="size-4 animate-spin"
              aria-label="Sincronizando"
            />
          ) : pendingCount > 0 ? (
            <Cloud
              data-testid="pending-sync-icon"
              className="size-4"
              aria-label={`${pendingCount} cambios pendientes de sincronizar`}
            />
          ) : (
            <CheckCircle
              data-testid="synced-icon"
              className="size-4"
              aria-label="Todo sincronizado"
            />
          )}
        </>
      ) : (
        <WifiOff data-testid="wifi-off-icon" className="size-4" aria-label="Sin conexión" />
      )}

      {/* Status text */}
      <span className="text-sm font-medium" data-testid="offline-status-text">
        {isOnline
          ? isSyncing
            ? "Sincronizando..."
            : pendingCount > 0
            ? `${pendingCount} pendiente${pendingCount > 1 ? "s" : ""} de sincronizar`
            : "Todo sincronizado ✓"
          : "Modo offline"}
      </span>

      {/* Sync button when online with pending changes */}
      {isOnline && pendingCount > 0 && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          data-testid="sync-button"
          className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors disabled:opacity-50"
          aria-label="Sincronizar ahora"
        >
          Sincronizar
        </button>
      )}

      {/* Pending count badge */}
      {isOnline && pendingCount > 0 && (
        <span
          data-testid="pending-count-badge"
          className="ml-1 px-2 py-0.5 text-xs bg-white/30 rounded-full"
          aria-label={`${pendingCount} mutaciones pendientes`}
        >
          {pendingCount}
        </span>
      )}
    </div>
  );
}