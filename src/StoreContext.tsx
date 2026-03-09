import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ViewMode, Donator, Fan, DroppedGift, EditingEntity, TransientEffect, ChatMessage } from './types';
import { GIFTS } from './constants';

interface StoreContextType {
    donators: Donator[];
    addDonator: (name: string, gift: string, price?: number) => void;
    updateDonator: (id: string, name: string, gift: string) => void;
    removeDonator: (id: string) => void;
    fans: Fan[];
    addFan: (name: string, level?: number) => void;
    updateFan: (id: string, name: string, level: number) => void;
    removeFan: (id: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    activeChallenge: string;
    setActiveChallenge: (challenge: string) => void;
    // Physics Jar
    droppedGifts: DroppedGift[];
    dropGift: (name: string, giftName: string) => void;
    pendingGift: string | null;
    setPendingGift: (giftName: string | null) => void;
    editingEntity: EditingEntity | null;
    setEditingEntity: (entity: EditingEntity | null) => void;
    lastFanLevel: number;
    setLastFanLevel: (level: number) => void;
    // TikTok Connection
    tiktokStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    tiktokUsername: string;
    tiktokError: string | null;
    isAutoMode: boolean;
    setIsAutoMode: (mode: boolean) => void;
    connectTiktok: (username: string) => void;
    disconnectTiktok: () => void;
    // Transient Effects
    effects: TransientEffect[];
    addEffect: (type: 'like' | 'follow' | 'gift', text: string) => void;
    // Chat
    chatMessages: ChatMessage[];
    // Video
    tiktokVideoUrl: string | null;
    // Coins
    totalCoins: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [donators, setDonators] = useState<Donator[]>(() => {
        try {
            const saved = localStorage.getItem('donators');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [fans, setFans] = useState<Fan[]>(() => {
        try {
            const saved = localStorage.getItem('fans');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [viewMode, setViewMode] = useState<ViewMode>('main');
    const [activeChallenge, setActiveChallenge] = useState<string>(() => {
        try {
            return localStorage.getItem('activeChallenge') || '';
        } catch (e) {
            return '';
        }
    });
    const [droppedGifts, setDroppedGifts] = useState<DroppedGift[]>(() => {
        try {
            const saved = localStorage.getItem('droppedGifts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [pendingGift, setPendingGift] = useState<string | null>(null);
    const [editingEntity, setEditingEntity] = useState<EditingEntity | null>(null);
    const [lastFanLevel, setLastFanLevel] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('lastFanLevel');
            return saved ? parseInt(saved) : 1;
        } catch (e) {
            return 1;
        }
    });

    // TikTok State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [tiktokStatus, setTiktokStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [tiktokUsername, setTiktokUsername] = useState<string>(() => {
        try {
            return localStorage.getItem('tiktokUsername') || '';
        } catch (e) {
            return '';
        }
    });
    const [tiktokError, setTiktokError] = useState<string | null>(null);
    const [isAutoMode, setIsAutoMode] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('isAutoMode');
            return saved !== null ? JSON.parse(saved) : true;
        } catch (e) {
            return true;
        }
    });
    const [effects, setEffects] = useState<TransientEffect[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [tiktokVideoUrl, setTiktokVideoUrl] = useState<string | null>(null);

    // Total coins logic: Load from storage or calculate from existing donators if missing
    const [totalCoins, setTotalCoins] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('totalCoins');
            if (saved !== null) return parseInt(saved);

            // Migration: calculate from existing donators if they exist but totalCoins doesn't
            const savedDonators = localStorage.getItem('donators');
            if (savedDonators) {
                const donatorsArr: Donator[] = JSON.parse(savedDonators);
                return donatorsArr.reduce((sum, d) => {
                    const gift = GIFTS.find(g => g.name === d.gift);
                    return sum + (gift?.price || 0);
                }, 0);
            }
            return 0;
        } catch (e) {
            return 0;
        }
    });

    const addEffect = (type: 'like' | 'follow' | 'gift', text: string) => {
        const padding = 100;
        const x = type === 'like'
            ? padding + Math.random() * (window.innerWidth - padding * 2)
            : window.innerWidth / 2 + (Math.random() * 200 - 100);
        const y = type === 'like'
            ? padding + Math.random() * (window.innerHeight - padding * 2)
            : window.innerHeight / 2 + (Math.random() * 200 - 100);

        const newEffect: TransientEffect = {
            id: crypto.randomUUID(),
            type,
            text,
            x,
            y,
            timestamp: Date.now()
        };

        setEffects(prev => [...prev, newEffect]);

        // Auto remove effect after animation finishes
        setTimeout(() => {
            setEffects(prev => prev.filter(e => e.id !== newEffect.id));
        }, type === 'follow' || type === 'gift' ? 4000 : 2500);
    };

    // Persist data locally
    useEffect(() => {
        localStorage.setItem('donators', JSON.stringify(donators));
    }, [donators]);

    useEffect(() => {
        localStorage.setItem('fans', JSON.stringify(fans));
    }, [fans]);

    useEffect(() => {
        localStorage.setItem('activeChallenge', activeChallenge);
    }, [activeChallenge]);

    useEffect(() => {
        localStorage.setItem('droppedGifts', JSON.stringify(droppedGifts));
    }, [droppedGifts]);

    useEffect(() => {
        localStorage.setItem('lastFanLevel', lastFanLevel.toString());
    }, [lastFanLevel]);

    useEffect(() => {
        localStorage.setItem('tiktokUsername', tiktokUsername);
    }, [tiktokUsername]);

    useEffect(() => {
        localStorage.setItem('isAutoMode', JSON.stringify(isAutoMode));
    }, [isAutoMode]);

    useEffect(() => {
        localStorage.setItem('totalCoins', totalCoins.toString());
    }, [totalCoins]);

    const addDonator = (name: string, giftName: string, price?: number) => {
        const giftObj = GIFTS.find(g => g.name === giftName);
        const newDonator = {
            id: crypto.randomUUID(),
            name,
            gift: giftName,
            timestamp: Date.now(),
            profilePictureUrl: undefined // Manual additions don't have this by default
        };

        setDonators((prev) => [newDonator, ...prev]);

        // Update total coins
        const coinAmount = price !== undefined ? price : (giftObj?.price || 0);
        setTotalCoins(prev => prev + coinAmount);

        if (giftObj) {
            setDroppedGifts(prev => [...prev, {
                ...newDonator,
                x: Math.random() * 400 + 100,
                y: -100,
                giftFile: giftObj.file
            }]);
        }
    };

    const dropGift = (name: string, giftName: string) => {
        addDonator(name, giftName);
    };

    const updateDonator = (id: string, name: string, giftName: string) => {
        const giftObj = GIFTS.find(g => g.name === giftName);
        setDonators((prev) => prev.map(d => d.id === id ? { ...d, name, gift: giftName } : d));
        if (giftObj) {
            setDroppedGifts(prev => prev.map(dg => dg.id === id ? { ...dg, name, gift: giftName, giftFile: giftObj.file } : dg));
        }
    };

    const removeDonator = (id: string) => {
        const target = donators.find(d => d.id === id);
        if (target) {
            const gift = GIFTS.find(g => g.name === target.gift);
            setTotalCoins(prev => Math.max(0, prev - (gift?.price || 0)));
        }
        setDonators((prev) => prev.filter(d => d.id !== id));
        setDroppedGifts((prev) => prev.filter(d => d.id !== id));
    };

    const addFan = (name: string, level: number = lastFanLevel) => {
        setLastFanLevel(level);
        const colors = ['#fff', '#34d399', '#3b82f6', '#f59e0b', '#ec4899']; // Nivel 1 to 5
        const fanColor = colors[Math.min(level - 1, colors.length - 1)];
        setFans((prev) => [{
            id: crypto.randomUUID(),
            name,
            level,
            color: fanColor,
            timestamp: Date.now()
        }, ...prev]);
        setViewMode('main');
    };

    const updateFan = (id: string, name: string, level: number) => {
        setLastFanLevel(level);
        const colors = ['#fff', '#34d399', '#3b82f6', '#f59e0b', '#ec4899'];
        const fanColor = colors[Math.min(level - 1, colors.length - 1)];
        setFans(prev => prev.map(f => f.id === id ? { ...f, name, level, color: fanColor } : f));
    };

    const removeFan = (id: string) => {
        setFans((prev) => prev.filter(f => f.id !== id));
    };

    useEffect(() => {
        const socketUrl = import.meta.env.PROD ? undefined : 'http://localhost:3001';
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            const savedUsername = localStorage.getItem('tiktokUsername');
            if (savedUsername) {
                setTiktokStatus('connecting');
                newSocket.emit('connect_tiktok', savedUsername);
            }
        });

        newSocket.on('tiktok_status', (data: { status: 'disconnected' | 'connecting' | 'connected' | 'error', username: string, message?: string }) => {
            setTiktokStatus(data.status);
            setTiktokUsername(data.username);
            if (data.status === 'error' && data.message) {
                setTiktokError(data.message);
            } else {
                setTiktokError(null);
            }
        });

        newSocket.on('tiktok_error', (data: { message: string }) => {
            setTiktokError(data.message);
            setTiktokStatus('error');
        });

        newSocket.on('tiktok_gift', (data: { nickname: string, giftName: string, giftPictureUrl: string, profilePictureUrl: string, diamondCount: number }) => {
            setIsAutoMode(currentAutoMode => {
                if (!currentAutoMode) return currentAutoMode;

                // Find matching gift
                const giftObj = GIFTS.find(g => g.name.toLowerCase() === data.giftName.toLowerCase()) || GIFTS[0];

                // Add to donators and drop physical item (addDonator now handles the price update)
                addDonator(data.nickname, giftObj.name, data.diamondCount);

                // Trigger announcement effect
                addEffect('gift', `${data.nickname} te ha regalado ${data.giftName}!`);

                return currentAutoMode;
            });
        });

        newSocket.on('tiktok_follow', (data: { nickname: string }) => {
            setIsAutoMode(currentAutoMode => {
                if (!currentAutoMode) return currentAutoMode;
                addEffect('follow', `${data.nickname} is now following!`);
                return currentAutoMode;
            });
        });

        newSocket.on('tiktok_like', (data: { nickname: string, likeCount: number }) => {
            setIsAutoMode(currentAutoMode => {
                if (!currentAutoMode) return currentAutoMode;
                const count = Math.min(data.likeCount, 5);
                for (let i = 0; i < count; i++) {
                    setTimeout(() => {
                        addEffect('like', data.nickname);
                    }, i * 150);
                }
                return currentAutoMode;
            });
        });

        newSocket.on('tiktok_chat', (data: { userId: string, uniqueId: string, nickname: string, comment: string, profilePictureUrl?: string }) => {
            const newMessage: ChatMessage = {
                id: crypto.randomUUID(),
                ...data,
                timestamp: Date.now(),
                side: 'left'
            };

            setChatMessages(prev => {
                const nextSide = prev.length > 0 && prev[0].side === 'left' ? 'right' : 'left';
                newMessage.side = nextSide;
                const updated = [newMessage, ...prev];
                return updated.slice(0, 50);
            });

            setTimeout(() => {
                setChatMessages(prev => prev.filter(m => m.id !== newMessage.id));
            }, 30000);
        });

        newSocket.on('tiktok_video_url', (data: { url: string }) => {
            setTiktokVideoUrl(data.url);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [isAutoMode]);

    const connectTiktok = (username: string) => {
        if (socket && username.trim()) {
            setTiktokError(null);
            setTiktokStatus('connecting');
            socket.emit('connect_tiktok', username.trim());
        }
    };

    const disconnectTiktok = () => {
        if (socket) {
            socket.emit('disconnect_tiktok');
        }
    };

    return (
        <StoreContext.Provider value={{
            donators, addDonator, updateDonator, removeDonator,
            fans, addFan, updateFan, removeFan,
            viewMode, setViewMode, activeChallenge, setActiveChallenge,
            droppedGifts, dropGift, pendingGift, setPendingGift,
            editingEntity, setEditingEntity, lastFanLevel, setLastFanLevel,
            tiktokStatus, tiktokUsername, tiktokError, connectTiktok, disconnectTiktok,
            isAutoMode, setIsAutoMode,
            effects, addEffect,
            chatMessages,
            tiktokVideoUrl,
            totalCoins
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within StoreProvider');
    return context;
};
