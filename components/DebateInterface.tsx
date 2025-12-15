
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type Message = {
    role: 'AFFIRMATIVE' | 'NEGATIVE';
    agent: string;
    content: string;
};

const MAX_TURNS = 10;

export default function DebateInterface() {
    const [resolution, setResolution] = useState('');
    const [started, setStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [turnIndex, setTurnIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState('');

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, error]);

    useEffect(() => {
        if (!started) return;
        if (turnIndex >= MAX_TURNS) return;
        if (isTyping) return;
        if (error) return;

        const triggerTurn = async () => {
            setIsTyping(true);
            setError('');

            try {
                const res = await fetch('/api/debate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        resolution,
                        history: messages,
                        turnIndex
                    }),
                });

                if (!res.ok) throw new Error('Failed to fetch turn');

                const data = await res.json();
                await new Promise(r => setTimeout(r, 1500));

                setMessages(prev => [...prev, {
                    role: data.role,
                    agent: data.agent,
                    content: data.content
                }]);

                setTurnIndex(prev => prev + 1);
            } catch (err) {
                setError('Connection interrupted. Click to retry.');
                console.error(err);
            } finally {
                setIsTyping(false);
            }
        };

        const timeout = setTimeout(triggerTurn, 1000);
        return () => clearTimeout(timeout);
    }, [started, turnIndex, isTyping, resolution, messages, error]);

    const handleStart = () => {
        if (!resolution.trim()) return;
        setStarted(true);
        setMessages([]);
        setTurnIndex(0);
        setError('');
    };

    const handleRetry = () => {
        setError('');
    };

    return (
        <div className="relative min-h-screen font-sans overflow-hidden bg-black text-white selection:bg-purple-500/30">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/background.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-40 blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="w-full p-6 text-center border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-20"
            >
                <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    DUAL AI DEBATER
                </h1>
                {started && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-cyan-200/60 text-sm mt-2 font-medium italic tracking-wide"
                    >
                        TOPIC: {resolution}
                    </motion.p>
                )}
            </motion.header>

            {/* Main Content */}
            <div className="relative z-10 flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6 h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">

                <AnimatePresence mode="wait">
                    {!started ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] gap-12"
                        >
                            <div className="relative w-full max-w-3xl flex justify-between items-center px-8">
                                <motion.div
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full group-hover:bg-cyan-500/50 transition-all duration-500" />
                                    <Image src="/avatars/affirmative.png" width={160} height={160} alt="Affirmative" className="rounded-full border-4 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.5)] relative z-10" />
                                </motion.div>

                                <div className="text-7xl font-black text-white/10 italic absolute left-1/2 -translate-x-1/2 z-0">VS</div>

                                <motion.div
                                    animate={{ y: [0, 20, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-rose-500/30 blur-3xl rounded-full group-hover:bg-rose-500/50 transition-all duration-500" />
                                    <Image src="/avatars/negative.png" width={160} height={160} alt="Negative" className="rounded-full border-4 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.5)] relative z-10" />
                                </motion.div>
                            </div>

                            <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md w-full max-w-xl flex flex-col gap-6 shadow-2xl">
                                <h2 className="text-3xl font-bold text-center text-white">বিতর্কের বিষয় লিখুন</h2>

                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-white/20 rounded-xl px-5 py-4 text-white text-lg focus:outline-none focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all placeholder:text-white/20"
                                        placeholder="যেমন: 'প্রযুক্তি কি আশীর্বাদ না অভিশাপ?'..."
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStart}
                                        disabled={!resolution}
                                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-lg"
                                    >
                                        শুরু করুন
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-8 pb-32 pt-8">
                            <AnimatePresence>
                                {messages.map((msg, idx) => {
                                    const isAff = msg.role === 'AFFIRMATIVE';
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: isAff ? -50 : 50, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                            className={`flex w-full ${isAff ? 'justify-start' : 'justify-end'} gap-4 items-end`}
                                        >
                                            {isAff && (
                                                <Image src="/avatars/affirmative.png" width={50} height={50} alt="Aff" className="rounded-full border-2 border-cyan-500 shadow-lg mb-2" />
                                            )}

                                            <div className={`max-w-[75%] relative group`}>
                                                <div className={`
                                px-6 py-5 rounded-3xl shadow-2xl backdrop-blur-md relative z-10
                                ${isAff
                                                        ? 'bg-gradient-to-br from-cyan-900/80 to-blue-900/80 border border-cyan-500/30 rounded-bl-sm text-cyan-50'
                                                        : 'bg-gradient-to-bl from-rose-900/80 to-red-900/80 border border-rose-500/30 rounded-br-sm text-rose-50'}
                            `}>
                                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">
                                                        {isAff ? 'Affirmative Agent' : 'Negative Agent'}
                                                    </div>
                                                    <p className="leading-relaxed whitespace-pre-wrap text-[15px] font-light tracking-wide">
                                                        {msg.content}
                                                    </p>
                                                </div>

                                                {/* Glow Effect */}
                                                <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10 ${isAff ? 'bg-cyan-500' : 'bg-rose-500'}`} />
                                            </div>

                                            {!isAff && (
                                                <Image src="/avatars/negative.png" width={50} height={50} alt="Neg" className="rounded-full border-2 border-rose-500 shadow-lg mb-2" />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`flex w-full ${turnIndex % 2 === 0 ? 'justify-start' : 'justify-end'} gap-3 items-center px-2`}
                                >
                                    <div className="relative">
                                        <div className={`absolute inset-0 blur-md rounded-full ${turnIndex % 2 === 0 ? 'bg-cyan-500/50' : 'bg-rose-500/50'} animate-pulse`} />
                                        <Image
                                            src={turnIndex % 2 === 0 ? "/avatars/affirmative.png" : "/avatars/negative.png"}
                                            width={40}
                                            height={40}
                                            alt="Typing"
                                            className={`rounded-full border-2 ${turnIndex % 2 === 0 ? 'border-cyan-500' : 'border-rose-500'} relative z-10 grayscale opacity-80`}
                                        />
                                    </div>
                                    <div className="text-xs font-mono text-white/50 tracking-widest animate-pulse">
                                        ANALYZING...
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center gap-3 py-6"
                                >
                                    <div className="text-rose-400 font-medium bg-rose-950/50 px-6 py-3 rounded-full border border-rose-500/20">
                                        🛑 {error}
                                    </div>
                                    <button
                                        onClick={handleRetry}
                                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all border border-white/10 hover:border-white/30 text-sm font-bold uppercase tracking-widest"
                                    >
                                        ↻ Retry Turn
                                    </button>
                                </motion.div>
                            )}

                            <div ref={bottomRef} className="h-12" />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Progress Bar */}
            {started && (
                <div className="fixed bottom-0 w-full h-1.5 bg-white/10 z-50">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(turnIndex / MAX_TURNS) * 100}%` }}
                        transition={{ ease: "easeOut", duration: 1 }}
                    />
                </div>
            )}
        </div>
    );
}
