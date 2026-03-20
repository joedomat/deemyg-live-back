import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { useStore } from '../StoreContext';
import { motion } from 'framer-motion';
import { Tv, X } from 'lucide-react';

const LiveMonitor = ({ isBackground = false }: { isBackground?: boolean }) => {
    const { tiktokVideoUrl } = useStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const bgVideoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const bgHlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        if (!tiktokVideoUrl) return;

        const setupHls = (videoEl: HTMLVideoElement, ref: React.MutableRefObject<Hls | null>) => {
            if (Hls.isSupported()) {
                if (ref.current) ref.current.destroy();
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    liveSyncDurationCount: 3,
                    liveMaxLatencyDurationCount: 10,
                    maxLiveSyncPlaybackRate: 1.5
                });
                hls.loadSource(tiktokVideoUrl);
                hls.attachMedia(videoEl);
                ref.current = hls;

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoEl.play().catch(e => console.error("Auto-play failed:", e));
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.warn("fatal network error encountered, try to recover");
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.warn("fatal media error encountered, try to recover");
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                break;
                        }
                    }
                });
            } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                videoEl.src = tiktokVideoUrl;
                videoEl.addEventListener('loadedmetadata', () => videoEl.play());
            }
        };

        if (videoRef.current) setupHls(videoRef.current, hlsRef);
        if (isBackground && bgVideoRef.current) setupHls(bgVideoRef.current, bgHlsRef);

        return () => {
            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
            if (bgHlsRef.current) { bgHlsRef.current.destroy(); bgHlsRef.current = null; }
        };
    }, [tiktokVideoUrl, isBackground]);

    if (!tiktokVideoUrl) return null;

    if (isBackground) {
        return (
            <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black pointer-events-none">
                {/* Layer 1: Blurred stretched background */}
                <video
                    ref={bgVideoRef}
                    className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-50 brightness-50"
                    muted
                    playsInline
                />

                {/* Layer 2: Original centered video */}
                <video
                    ref={videoRef}
                    className="relative w-full h-full object-contain filter brightness-[0.45] z-10"
                    muted
                    playsInline
                />

                {/* Cinematic Vignette Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.9) 60%, rgba(0,0,0,1) 80%)'
                    }}
                />
            </div>
        );
    }

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-6 right-6 max-h-[35vh] w-auto bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-10 group cursor-move flex items-center justify-center"
        >
            <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Live Monitor</span>
                </div>
                <Tv className="w-3 h-3 text-white/40" />
            </div>

            <video
                ref={videoRef}
                className="max-h-full w-auto object-contain"
                muted
                playsInline
            />
        </motion.div>
    );
};

export default LiveMonitor;
