import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/presentation/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  
  if (isOnline) return null;
  
  return (
    <div 
      data-testid="offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg shadow-lg"
    >
      <WifiOff data-testid="wifi-off-icon" className="size-4" />
      <span className="text-sm font-medium">Modo offline</span>
    </div>
  );
}