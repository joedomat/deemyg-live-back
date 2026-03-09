import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const wallpapers = [
    '218634d1-640f-45a4-a9b5-42ff4f2bc2c2.jpeg',
    '288b3191-7568-44f4-a2bb-116a74d54e2f.jpeg',
    '4726e8dd-e767-4537-a7e4-711c0e0a1868.jpeg',
    '782e634e-e00e-4990-b07d-a88365395a5e.jpeg',
    '8ccc145b-052c-43bc-bf8c-31c270d5c81c.jpeg',
    'd6836c5f-d704-4d1a-ad5f-51ee26524dbd.jpeg',
    'e3f9ddb4-e846-415b-88d3-95e04e6e5739.jpeg',
    'f3f3aaa3-af4c-4c31-a6d0-e931c371333d.jpeg',
    'f874ecd5-ced8-4dc7-aaf7-c2985260521e.jpeg'
];

const BackgroundSlideshow = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Change photo every 4 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % wallpapers.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black pointer-events-none">
            <AnimatePresence>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <img
                        src={`/wallpapers/${wallpapers[currentIndex]}`}
                        className="w-full h-full object-contain filter brightness-[0.35]"
                        alt="Background Slide"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Dark vignette blending overlay to fade non-16:9 edges perfectly to black */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.9) 60%, rgba(0,0,0,1) 80%)'
                }}
            />
        </div>
    );
};

export default BackgroundSlideshow;
