import { useState } from 'react';
import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

const TableView = () => {
    const {
        donators, fans,
        tiktokStatus, tiktokUsername, tiktokError, connectTiktok, disconnectTiktok,
        isAutoMode, setIsAutoMode
    } = useStore();
    const [inputUsername, setInputUsername] = useState('');

    return (
        <div className="flex flex-col w-full min-h-screen bg-black text-white p-12 overflow-y-auto">
            <h1 className="text-6xl font-display font-bold text-primary mb-8 uppercase tracking-widest text-center">
                Supporters Wall
            </h1>

            {/* TikTok Live Connection Panel */}
            <div className={`max-w-7xl mx-auto w-full mb-12 border rounded-2xl p-8 flex flex-col items-center gap-6 transition-colors ${isAutoMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-800/50 grayscale opacity-80'
                }`}>
                <div className="flex flex-col md:flex-row w-full items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-2xl font-bold text-white">TikTok Live Connector</h2>
                            <button
                                onClick={() => setIsAutoMode(!isAutoMode)}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isAutoMode ? 'bg-primary' : 'bg-zinc-700'
                                    }`}
                            >
                                <span className="sr-only">Toggle Auto Mode</span>
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isAutoMode ? 'translate-x-8' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                            <span className={`text-sm font-bold ${isAutoMode ? 'text-primary' : 'text-zinc-500'}`}>
                                {isAutoMode ? 'AUTOPILOT ON' : 'MANUAL MODE'}
                            </span>
                        </div>
                        <p className="text-zinc-400">
                            {isAutoMode
                                ? 'Automate gifts and fans tracking by connecting to a live stream.'
                                : 'Incoming events are paused. You can drop items manually via keyboard.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {tiktokStatus === 'disconnected' || tiktokStatus === 'error' ? (
                            <>
                                <input
                                    type="text"
                                    value={inputUsername}
                                    onChange={(e) => setInputUsername(e.target.value)}
                                    placeholder="@username"
                                    disabled={!isAutoMode}
                                    className="bg-black border border-zinc-700 rounded-xl px-6 py-3 text-white text-xl placeholder:text-zinc-600 focus:outline-none focus:border-primary w-64 disabled:opacity-50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') connectTiktok(inputUsername);
                                    }}
                                />
                                <button
                                    onClick={() => connectTiktok(inputUsername)}
                                    disabled={!inputUsername || !isAutoMode}
                                    className="bg-primary hover:bg-primary/90 text-black font-bold px-8 py-3 rounded-xl text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Connect
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className={`flex h-4 w-4 rounded-full relative ${!isAutoMode ? 'bg-zinc-600' : tiktokStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                                        }`}>
                                        {isAutoMode && tiktokStatus === 'connected' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                    </span>
                                    <span className={`text-xl font-bold ${!isAutoMode ? 'text-zinc-500' : 'text-white'}`}>
                                        {tiktokStatus === 'connecting' ? 'Connecting to ' : 'Connected to '}
                                        <span className={!isAutoMode ? 'text-zinc-500' : 'text-primary'}>@{tiktokUsername}</span>
                                    </span>
                                </div>
                                <button
                                    onClick={disconnectTiktok}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold px-6 py-2 rounded-lg transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {tiktokError && (
                <div className="max-w-7xl mx-auto w-full mb-8 bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-xl text-center font-bold">
                    {tiktokError}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto w-full">
                {/* Donators */}
                <div>
                    <h2 className="text-4xl font-bold mb-8 text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-4">
                        Donators
                    </h2>
                    <div className="flex flex-col gap-6">
                        {donators.length === 0 ? (
                            <p className="text-2xl text-zinc-600">No donators yet.</p>
                        ) : donators.map((d, i) => (
                            <motion.div
                                key={d.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800"
                            >
                                <span className="text-5xl font-bold">{d.name}</span>
                                <span className="text-4xl font-black text-primary bg-primary/10 px-6 py-2 rounded-full">
                                    {d.gift}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Fans */}
                <div>
                    <h2 className="text-4xl font-bold mb-8 text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-4">
                        Fan Club
                    </h2>
                    <div className="flex flex-col gap-6">
                        {fans.length === 0 ? (
                            <p className="text-2xl text-zinc-600">No fans yet.</p>
                        ) : fans.map((f, i) => (
                            <motion.div
                                key={f.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800"
                            >
                                <span className="text-4xl mr-6">⭐</span>
                                <span className="text-5xl font-bold">{f.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableView;
