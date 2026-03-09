export interface Gift {
    name: string;
    price: number;
    file: string;
    hotkey?: string;
}

export const GIFTS: Gift[] = [
    { name: "Rose", price: 1, file: "Rose.webp", hotkey: "r" },
    { name: "Pop", price: 1, file: "Pop.webp", hotkey: "p" },
    { name: "GG", price: 1, file: "GG.webp", hotkey: "g" },
    { name: "TikTok", price: 1, file: "TikTok.webp", hotkey: "t" },
    { name: "Ice Cream Cone", price: 1, file: "Ice Cream Cone.webp", hotkey: "i" },
    { name: "Glow Stick", price: 1, file: "Glow Stick.webp", hotkey: "s" },
    { name: "Cake Slice", price: 1, file: "Cake Slice.webp", hotkey: "k" },
    { name: "Heart Me", price: 1, file: "Heart Me.webp", hotkey: "h" },
    { name: "Thumbs Up", price: 1, file: "Thumbs Up.webp", hotkey: "u" },
    { name: "Heart", price: 1, file: "Heart.webp", hotkey: "e" }, // 'e' for hEart since 'h' taken
    { name: "Finger Heart", price: 5, file: "Finger Heart.webp", hotkey: "y" }, // Changed from 'f'
    { name: "Doughnut", price: 30, file: "Doughnut.webp", hotkey: "d" }, // Changed from 'u'
];

// Better mapping using Numpad for some and letters for others
export const HOTKEY_MAP: Record<string, string> = {
    "r": "Rose",
    "p": "Pop",
    "g": "GG",
    "t": "TikTok",
    "i": "Ice Cream Cone",
    "s": "Glow Stick",
    "k": "Cake Slice",
    "h": "Heart Me",
    "u": "Thumbs Up",
    "e": "Heart",
    "y": "Finger Heart",
    "n": "Ice Cream Mic",
    "1": "Rose",
    "2": "Pop",
    "3": "GG",
};

export const PHYSICS_CONFIG = {
    JAR_WIDTH: 800,
    JAR_HEIGHT: 600,
    GIFT_SIZE: 60,
    GRAVITY: 1,
};
