export type ViewMode = 'main' | 'table' | 'challenge' | 'dashboard';

export interface Donator {
    id: string;
    name: string;
    gift: string;
    timestamp: number;
    profilePictureUrl?: string;
}

export interface Fan {
    id: string;
    name: string;
    level: number;
    color?: string;
    timestamp: number;
}

export interface DroppedGift extends Donator {
    x: number;
    y: number;
    giftFile: string;
}

export interface EditingEntity {
    id: string;
    type: 'fan' | 'donator';
}

export interface TransientEffect {
    id: string;
    type: 'like' | 'follow' | 'gift' | 'join';
    text: string;
    x: number;
    y: number;
    timestamp: number;
}

export interface ChatMessage {
    id: string;
    userId: string;
    uniqueId: string;
    nickname: string;
    comment: string;
    profilePictureUrl?: string;
    timestamp: number;
    side: 'left' | 'right';
}
