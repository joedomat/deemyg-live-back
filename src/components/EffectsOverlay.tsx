import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../StoreContext';

const EffectsOverlay = () => {
    const { effects } = useStore();

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {effects.map(effect => {
                    if (effect.type === 'follow') {
                        return (
                            <motion.div
                                key={effect.id}
                                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -50, scale: 1.2 }}
                                transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
                                className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none"
                                style={{
                                    // Override initial left/top if needed, but for big announcements
                                    // center screen is better than random coords in effect
                                }}
                            >
                                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-[0_5px_15px_rgba(236,72,153,0.5)] uppercase tracking-wider text-center">
                                    New Follower!
                                </div>
                                <div className="text-2xl md:text-4xl font-bold text-white mt-4 drop-shadow-md">
                                    {effect.text}
                                </div>
                            </motion.div>
                        );
                    }

                    if (effect.type === 'like') {
                        return (
                            <motion.div
                                key={effect.id}
                                initial={{ opacity: 0, y: 20, scale: 0.5, x: 0 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    y: -150,
                                    scale: [0.5, 1.2, 1, 0.8],
                                    x: (Math.random() - 0.5) * 100 // drift randomly
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2.5, ease: 'easeOut' }}
                                className="absolute pointer-events-none flex items-center justify-center"
                                style={{
                                    left: effect.x,
                                    top: effect.y,
                                }}
                            >
                                <div className="relative flex flex-col items-center">
                                    <span className="text-4xl">❤️</span>
                                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                                        {effect.text}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    }

                    return null;
                })}
            </AnimatePresence>
        </div>
    );
};

export default EffectsOverlay;
