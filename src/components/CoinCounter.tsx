import React, { useEffect, useState } from 'react';
import { useStore } from '../StoreContext';
import { motion, useAnimation } from 'framer-motion';

const CoinCounter = () => {
    const { totalCoins } = useStore();
    const [displayCoins, setDisplayCoins] = useState(totalCoins);
    const controls = useAnimation();

    useEffect(() => {
        if (totalCoins !== displayCoins) {
            // "Pop" animation on container
            if (totalCoins > displayCoins) {
                controls.start({
                    scale: [1, 1.15, 1],
                    transition: { duration: 0.3 }
                });
            }

            // Simple robust update for the number
            // (framer-motion useSpring is better but requires more setup for string formatting)
            const timeout = setTimeout(() => {
                setDisplayCoins(totalCoins);
            }, 50); // Small delay to feel "live" but not laggy

            return () => clearTimeout(timeout);
        }
    }, [totalCoins, controls, displayCoins]);

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
            <motion.div
                animate={controls}
                className="bg-black/60 backdrop-blur-xl border-2 border-primary/40 px-8 py-3 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative overflow-hidden group"
            >
                {/* Background glow sweep */}
                <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                />

                <div className="relative w-10 h-10 flex items-center justify-center">
                    <img
                        src="/coin.webp"
                        alt="TikTok Coins"
                        className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                    />
                </div>

                <div className="flex flex-col items-center border-r border-white/10 pr-6 mr-2">
                    <span className="text-[10px] font-black text-primary/80 uppercase tracking-[0.2em] -mb-1">
                        TIKTOK COINS
                    </span>
                    <span className="text-4xl font-black text-white tabular-nums drop-shadow-md">
                        {displayCoins.toLocaleString()}
                    </span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-green-400/80 uppercase tracking-[0.2em] -mb-1">
                        EST. REVENUE (USD)
                    </span>
                    <span className="text-4xl font-black text-green-400 tabular-nums drop-shadow-md">
                        ${(displayCoins * 0.005).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default CoinCounter;
