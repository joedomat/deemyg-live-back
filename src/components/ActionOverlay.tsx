import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionOverlayProps {
    action: 'donator' | 'fan' | 'challenge' | null;
    onClose: () => void;
}

const ActionOverlay: React.FC<ActionOverlayProps> = ({ action, onClose }) => {
    const { addDonator, updateDonator, removeDonator, addFan, updateFan, removeFan, setActiveChallenge, setViewMode, lastFanLevel, editingEntity, fans, donators } = useStore();
    const [name, setName] = useState('');
    const [gift, setGift] = useState('');
    const [challenge, setChallenge] = useState('');
    const [level, setLevel] = useState(lastFanLevel);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (action) {
            if (editingEntity && action === 'fan') {
                const fan = fans.find(f => f.id === editingEntity.id);
                if (fan) {
                    setName(fan.name);
                    setLevel(fan.level || 1);
                }
            } else if (editingEntity && action === 'donator') {
                const donator = donators.find(d => d.id === editingEntity.id);
                if (donator) {
                    setName(donator.name);
                    setGift(donator.gift);
                }
            } else {
                setName('');
                setGift('');
                setChallenge('');
                setLevel(lastFanLevel);
            }

            // Delay focus slightly to allow animation to complete
            const timeout = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 150);
            return () => clearTimeout(timeout);
        }
    }, [action, editingEntity, fans, donators, lastFanLevel]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEntity) {
            if (action === 'donator' && name && gift) {
                updateDonator(editingEntity.id, name, gift);
            } else if (action === 'fan' && name) {
                updateFan(editingEntity.id, name, level);
            }
        } else {
            if (action === 'donator' && name && gift) {
                addDonator(name, gift);
            } else if (action === 'fan' && name) {
                addFan(name, level);
            } else if (action === 'challenge' && challenge) {
                setActiveChallenge(challenge);
                setViewMode('challenge');
            }
        }
        onClose();
    };

    const titles = {
        donator: "Add Donator",
        fan: "Add Fan Club Member",
        challenge: "Set Active Challenge",
    };

    // Keyboard shortcut to close on Esc is handled by useHotkeys mostly,
    // but let's make sure form inputs don't stop it if needed, or handle inside form.
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {action && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-8 pointer-events-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.form
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        onSubmit={handleSubmit}
                        className="flex flex-col items-center gap-12 w-full max-w-5xl px-8"
                    >
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-black text-primary/70 uppercase tracking-[0.5em] mb-4 text-center"
                        >
                            {editingEntity ? `EDIT ${action}` : action === 'donator' ? 'NEW DONATOR' : action === 'fan' ? 'NEW FAN' : 'NEW CHALLENGE'}
                        </motion.h2>

                        <div className="flex flex-col gap-12 w-full items-center">
                            {(action === 'donator' || action === 'fan') && (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    spellCheck={false}
                                    autoComplete="off"
                                    className="w-full bg-transparent text-white text-7xl sm:text-9xl tracking-widest text-center focus:outline-none font-black uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                    style={{ textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                                    autoFocus
                                />
                            )}

                            {action === 'fan' && (
                                <div className="flex gap-4 w-full justify-center">
                                    {[1, 2, 3, 4, 5].map(lvl => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => setLevel(lvl)}
                                            className={`w-20 h-20 rounded-full border-2 transition-all font-black text-3xl ${level === lvl ? 'bg-primary border-primary text-black scale-110' : 'bg-transparent border-zinc-800 text-zinc-600'}`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {action === 'donator' && (
                                <input
                                    type="text"
                                    value={gift}
                                    onChange={e => setGift(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    spellCheck={false}
                                    autoComplete="off"
                                    className="w-full bg-transparent text-primary text-5xl sm:text-7xl tracking-widest text-center focus:outline-none font-bold uppercase drop-shadow-[0_0_30px_rgba(255,100,0,0.4)]"
                                    style={{ textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                                />
                            )}

                            {action === 'challenge' && (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={challenge}
                                    onChange={e => setChallenge(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    spellCheck={false}
                                    autoComplete="off"
                                    className="w-full bg-transparent text-[#ff3333] text-6xl sm:text-8xl tracking-tight text-center focus:outline-none font-black uppercase drop-shadow-[0_0_50px_rgba(255,50,50,0.5)]"
                                    style={{ textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                                />
                            )}

                            {editingEntity && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (action === 'fan') removeFan(editingEntity.id);
                                        else if (action === 'donator') removeDonator(editingEntity.id);
                                        onClose();
                                    }}
                                    className="text-red-500 mt-8 uppercase font-bold tracking-[0.3em] hover:text-red-400 opacity-50 hover:opacity-100 transition-all text-xl"
                                >
                                    Delete {action}
                                </button>
                            )}
                        </div>
                    </motion.form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ActionOverlay;
