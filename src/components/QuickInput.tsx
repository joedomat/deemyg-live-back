import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../StoreContext';
import { GIFTS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

const QuickInput = () => {
    const { pendingGift, setPendingGift, dropGift } = useStore();
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (pendingGift) {
            setName('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [pendingGift]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pendingGift && name.trim()) {
            dropGift(name, pendingGift);
            setPendingGift(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setPendingGift(null);
        }
    };

    const currentGift = GIFTS.find(g => g.name === pendingGift);

    return (
        <AnimatePresence>
            {pendingGift && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col items-center gap-12 w-full max-w-5xl px-8"
                    >
                        {currentGift && (
                            <motion.img
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", bounce: 0.6 }}
                                src={`/gifts/${currentGift.file}`}
                                alt={currentGift.name}
                                className="w-48 h-48 sm:w-64 sm:h-64 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                            />
                        )}

                        <motion.input
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            autoComplete="off"
                            autoFocus
                            className="w-full bg-transparent text-white text-7xl sm:text-9xl tracking-widest text-center focus:outline-none font-black uppercase drop-shadow-[0_0_50px_rgba(255,100,0,0.5)]"
                            style={{ textShadow: '0 10px 40px rgba(0,0,0,0.9)' }}
                        />
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QuickInput;
