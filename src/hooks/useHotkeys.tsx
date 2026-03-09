import { useEffect } from 'react';
import { useStore } from '../StoreContext';
import { HOTKEY_MAP } from '../constants';

export const useHotkeys = (openActionOverlay: (action: 'donator' | 'fan' | 'challenge') => void) => {
    const { setViewMode, setPendingGift, viewMode } = useStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                if (e.key === 'Escape') {
                    (document.activeElement as HTMLElement).blur();
                }
                return;
            }

            if (e.key === '1') {
                setViewMode('main');
            } else if (e.key === '2') {
                setViewMode('table');
            } else if (e.key === '3') {
                setViewMode('challenge');
            } else if (e.key === '9') {
                setViewMode('dashboard');
            } else if (e.key === 'Escape') {
                setViewMode('main');
                setPendingGift(null);
            } else {
                const giftName = HOTKEY_MAP[e.key.toLowerCase()];
                if (giftName) {
                    e.preventDefault();
                    setPendingGift(giftName);
                    setViewMode('main');
                } else if (e.key.toLowerCase() === 'f') {
                    e.preventDefault();
                    // Just open the overlay for fan level or use default
                    openActionOverlay('fan');
                } else if (e.key.toLowerCase() === 'c') {
                    e.preventDefault();
                    openActionOverlay('challenge');
                } else if (e.key.toLowerCase() === 'x') {
                    if (confirm("¿Limpiar todo el tarro y los datos persistidos?")) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setViewMode, openActionOverlay, viewMode, setPendingGift]);
};
