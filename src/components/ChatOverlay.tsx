import React from 'react';
import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../types';

const MessageItem = React.memo(({ msg, side }: { msg: ChatMessage, side: 'left' | 'right' }) => (
    <motion.div
        layout
        initial={{ opacity: 0, x: side === 'left' ? -30 : 30, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
        className={`flex items-center gap-4 bg-[#050505] border-[3px] border-primary/60 p-5 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] max-w-sm w-full ${side === 'right' ? 'flex-row-reverse text-right' : ''
            }`}
    >
        {msg.profilePictureUrl && (
            <img
                src={msg.profilePictureUrl}
                alt={msg.nickname}
                className="w-14 h-14 rounded-full border-2 border-primary flex-shrink-0 shadow-lg object-cover"
            />
        )}
        <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-1">
                {msg.nickname}
            </span>
            <p className="text-xl font-black text-white leading-tight break-words drop-shadow-md">
                {msg.comment}
            </p>
        </div>
    </motion.div>
));

const ChatOverlay = () => {
    const { chatMessages } = useStore();

    // Use persistent .side property
    const leftMessages = chatMessages.filter(msg => msg.side === 'left');
    const rightMessages = chatMessages.filter(msg => msg.side === 'right');

    return (
        <div className="fixed inset-0 pointer-events-none z-50 p-8 flex justify-between items-end gap-10">
            {/* Left Column Stack */}
            <div className="flex flex-col-reverse gap-6 w-full max-w-[360px] items-start pb-24 overflow-visible">
                <AnimatePresence initial={false} mode="popLayout">
                    {leftMessages.map((msg) => (
                        <MessageItem key={msg.id} msg={msg} side="left" />
                    ))}
                </AnimatePresence>
            </div>

            {/* Right Column Stack */}
            <div className="flex flex-col-reverse gap-6 w-full max-w-[360px] items-end pb-24 overflow-visible">
                <AnimatePresence initial={false} mode="popLayout">
                    {rightMessages.map((msg) => (
                        <MessageItem key={msg.id} msg={msg} side="right" />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ChatOverlay;
