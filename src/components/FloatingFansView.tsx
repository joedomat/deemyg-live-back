import React, { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { useStore } from '../StoreContext';
import { Fan } from '../types';

const getFanSize = (level: number): number => {
    const l = level || 1;
    if (l >= 20) return 380;
    if (l >= 15) return 320;
    if (l >= 10) return 260;
    if (l >= 5) return 200;
    return 140 + l * 10;
};

const FloatingFansView = () => {
    const { fans, setEditingEntity } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const bodiesMapRef = useRef<Map<string, Matter.Body>>(new Map());
    const elementsMapRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const sizesMapRef = useRef<Map<string, number>>(new Map());
    const runnerRef = useRef<Matter.Runner | null>(null);
    const rafRef = useRef<number>(0);

    // Initialize engine once
    useEffect(() => {
        const engine = Matter.Engine.create({ gravity: { x: 0, y: -0.12 } });
        engineRef.current = engine;

        const cw = window.innerWidth;
        const ch = window.innerHeight;

        // Side walls only — NO floor and NO ceiling so bubbles wrap naturally
        const opts: Matter.IBodyDefinition = { isStatic: true, restitution: 0.3 };
        Matter.Composite.add(engine.world, [
            Matter.Bodies.rectangle(-100, ch / 2, 100, ch + 800, opts),
            Matter.Bodies.rectangle(cw + 100, ch / 2, 100, ch + 800, opts),
        ]);

        const runner = Matter.Runner.create();
        runnerRef.current = runner;
        Matter.Runner.run(runner, engine);

        // Animation loop — direct DOM, GPU-composited transforms
        const tick = () => {
            const bodiesMap = bodiesMapRef.current;
            const elementsMap = elementsMapRef.current;
            const sizesMap = sizesMapRef.current;
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;

            for (const [id, body] of bodiesMap.entries()) {
                // Gentle random drift
                Matter.Body.applyForce(body, body.position, {
                    x: (Math.random() - 0.5) * 0.0002,
                    y: 0,
                });

                // Wrap: float off top → reappear at bottom
                if (body.position.y < -300) {
                    Matter.Body.setPosition(body, {
                        x: screenW * 0.1 + Math.random() * screenW * 0.8,
                        y: screenH + 150 + Math.random() * 100,
                    });
                    Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 0.8, y: -1.5 });
                }

                // GPU-composited DOM update
                const el = elementsMap.get(id);
                if (el) {
                    const half = (sizesMap.get(id) || 150) / 2;
                    el.style.transform = `translate3d(${body.position.x - half}px,${body.position.y - half}px,0) rotate(${body.angle}rad)`;
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        const bodiesMap = bodiesMapRef.current;
        const sizesMap = sizesMapRef.current;

        return () => {
            cancelAnimationFrame(rafRef.current);
            Matter.Runner.stop(runner);
            Matter.Engine.clear(engine);
            engineRef.current = null;
            runnerRef.current = null;
            bodiesMap.clear(); // Required for React 18 StrictMode
            sizesMap.clear();
        };
    }, []);

    // Sync fan data → physics bodies
    useEffect(() => {
        const engine = engineRef.current;
        if (!engine) return;

        const bodiesMap = bodiesMapRef.current;
        const sizesMap = sizesMapRef.current;
        const currentFanIds = new Set(fans.map(f => f.id));
        const cw = window.innerWidth;
        const ch = window.innerHeight;

        // Remove bodies for deleted fans
        for (const [id, body] of bodiesMap.entries()) {
            if (!currentFanIds.has(id)) {
                Matter.Composite.remove(engine.world, body);
                bodiesMap.delete(id);
                sizesMap.delete(id);
            }
        }

        // Add bodies for new fans
        fans.forEach((fan, i) => {
            if (bodiesMap.has(fan.id)) return;

            const size = getFanSize(fan.level || 1);
            const radius = size / 2;
            const spawnX = cw * 0.1 + ((i * 170 + Math.random() * 100) % (cw * 0.8));
            // Cap depth so they stagger nicely but don't spawn thousands of pixels down
            const spawnY = ch + 50 + ((i % 10) * 80) + Math.random() * 100;

            const body = Matter.Bodies.circle(spawnX, spawnY, radius, {
                restitution: 0.3,
                friction: 0.02,
                frictionAir: 0.015,
                density: 0.0008,
                label: fan.id,
            });
            bodiesMap.set(fan.id, body);
            sizesMap.set(fan.id, size);
            Matter.Composite.add(engine.world, body);
        });
    }, [fans]);

    // Register DOM ref
    const registerElement = useCallback((id: string, el: HTMLDivElement | null) => {
        if (el) {
            elementsMapRef.current.set(id, el);
        } else {
            elementsMapRef.current.delete(id);
        }
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {fans.map(fan => {
                const size = getFanSize(fan.level || 1);
                const isVIP = (fan.level || 1) >= 20;
                const isHigh = (fan.level || 1) >= 10;

                return (
                    <div
                        key={fan.id}
                        ref={(el) => registerElement(fan.id, el)}
                        className="absolute top-0 left-0 pointer-events-auto cursor-pointer hover:brightness-125"
                        style={{
                            width: size,
                            height: size,
                            willChange: 'transform',
                            contain: 'layout style paint',
                        }}
                        onClick={() => setEditingEntity({ id: fan.id, type: 'fan' })}
                    >
                        <div
                            className="w-full h-full rounded-full flex flex-col items-center justify-center p-4"
                            style={{
                                background: isVIP
                                    ? `radial-gradient(circle at 30% 30%, ${fan.color}88, ${fan.color}22, transparent)`
                                    : isHigh
                                        ? `radial-gradient(circle at 30% 30%, ${fan.color}55, transparent)`
                                        : (fan.level || 1) > 1
                                            ? `radial-gradient(circle at 30% 30%, ${fan.color}33, transparent)`
                                            : 'rgba(255,255,255,0.04)',
                                border: isVIP ? `4px solid ${fan.color}` : `1px solid ${fan.color}44`,
                                boxShadow: isVIP
                                    ? `0 0 80px ${fan.color}66, inset 0 0 40px ${fan.color}33`
                                    : isHigh
                                        ? `0 0 50px ${fan.color}33`
                                        : (fan.level || 1) > 3
                                            ? `0 0 30px ${fan.color}18`
                                            : 'none',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            {isVIP && (
                                <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-1">
                                    VIP LV{fan.level}
                                </span>
                            )}
                            <span
                                className="w-full text-center font-black leading-tight"
                                style={{
                                    color: isVIP ? '#fff' : fan.color,
                                    fontSize: isVIP ? '2rem' : isHigh ? '1.5rem' : '1.2rem',
                                    textShadow: isVIP
                                        ? '0 0 30px rgba(255,255,255,0.6)'
                                        : '0 2px 8px rgba(0,0,0,0.8)',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                }}
                            >
                                {fan.name}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FloatingFansView;
