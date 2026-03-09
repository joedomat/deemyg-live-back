import { useStore } from '../StoreContext';
import { motion } from 'framer-motion';

const ChallengeView = () => {
    const { activeChallenge } = useStore();

    return (
        <div className="flex items-center justify-center w-full min-h-screen bg-black text-white p-12">
            {activeChallenge ? (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="flex flex-col items-center gap-12 text-center"
                >
                    <span className="text-4xl font-bold text-destructive uppercase tracking-[0.2em] bg-destructive/20 px-8 py-3 rounded-full">
                        Active Challenge
                    </span>
                    <h1 className="text-7xl sm:text-[120px] font-black font-display uppercase tracking-tight leading-none drop-shadow-[0_0_50px_rgba(255,0,0,0.3)]">
                        {activeChallenge}
                    </h1>
                </motion.div>
            ) : (
                <div className="text-6xl font-bold text-zinc-700 opacity-50 uppercase tracking-widest">
                    No active challenge
                </div>
            )}
        </div>
    );
};

export default ChallengeView;
