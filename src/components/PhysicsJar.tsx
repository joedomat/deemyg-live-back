import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { useStore } from '../StoreContext';
import { PHYSICS_CONFIG } from '../constants';

const PhysicsJar = () => {
    const scene = useRef<HTMLDivElement>(null);
    const engine = useRef(Matter.Engine.create());
    const { droppedGifts, setEditingEntity, donators } = useStore();
    const processedGifts = useRef<Set<string>>(new Set());
    const profileImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

    useEffect(() => {
        if (!scene.current) return;

        const cw = window.innerWidth;
        const ch = window.innerHeight;

        const render = Matter.Render.create({
            element: scene.current,
            engine: engine.current,
            options: {
                width: cw,
                height: ch,
                wireframes: false,
                background: 'transparent',
            },
        });

        // Boundaries — render hidden to avoid gray lines
        const boundaryOpts = { isStatic: true, render: { visible: false } };
        // Put ceiling far up so gifts spawned at -100 don't hit the roof immediately
        const ceiling = Matter.Bodies.rectangle(cw / 2, -800, cw, 100, boundaryOpts);
        const ground = Matter.Bodies.rectangle(cw / 2, ch + 50, cw, 100, boundaryOpts);
        const leftWall = Matter.Bodies.rectangle(-50, ch / 2, 100, ch + 1000, boundaryOpts);
        const rightWall = Matter.Bodies.rectangle(cw + 50, ch / 2, 100, ch + 1000, boundaryOpts);

        Matter.Composite.add(engine.current.world, [ceiling, ground, leftWall, rightWall]);

        const runner = Matter.Runner.create();
        const currentEngine = engine.current;
        const currentRender = render;

        Matter.Runner.run(runner, currentEngine);
        Matter.Render.run(currentRender);

        // Add mouse control
        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(currentEngine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });
        Matter.Composite.add(currentEngine.world, mouseConstraint);
        render.mouse = mouse;

        // Click-to-edit logic
        let mousedownPosition = { x: 0, y: 0 };
        let mousedownTime = 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Matter.Events.on(mouseConstraint, 'mousedown', (event: any) => {
            if (mouseConstraint.body) {
                mousedownPosition = { x: event.mouse.position.x, y: event.mouse.position.y };
                mousedownTime = Date.now();
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Matter.Events.on(mouseConstraint, 'mouseup', (event: any) => {
            if (mouseConstraint.body && mousedownTime) {
                const dx = event.mouse.position.x - mousedownPosition.x;
                const dy = event.mouse.position.y - mousedownPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const timeElapsed = Date.now() - mousedownTime;

                if (distance < 10 && timeElapsed < 300) {
                    const donatorId = (mouseConstraint.body as unknown as { donatorId?: string }).donatorId;
                    if (donatorId) {
                        setEditingEntity({ id: donatorId, type: 'donator' });
                    }
                }
            }
            mousedownTime = 0;
        });

        // Render clustered names and profile pictures
        const profileImages = profileImagesRef.current;
        Matter.Events.on(render, 'afterRender', () => {
            const context = render.context;
            const bodies = Matter.Composite.allBodies(engine.current.world);

            const clusteredBodies = new Map<string, { body: Matter.Body, count: number }>();

            bodies.forEach((body) => {
                if (body.label && body.label !== 'Rectangle Body' && body.label !== 'Circle Body') {
                    const b = body as unknown as { profilePictureUrl?: string; giftFile?: string };

                    // 1. ALWAYS draw the profile picture on every single item
                    if (b.profilePictureUrl) {
                        let img = profileImages.get(b.profilePictureUrl);
                        if (!img) {
                            img = new Image();
                            img.crossOrigin = 'Anonymous';
                            img.src = b.profilePictureUrl;
                            profileImages.set(b.profilePictureUrl, img);
                        }

                        if (img.complete && img.naturalHeight !== 0) {
                            const imgSize = 32;
                            const imgX = body.position.x - imgSize / 2;
                            const imgY = body.position.y - 75;

                            context.save();
                            context.beginPath();
                            context.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2, true);
                            context.closePath();
                            context.clip();
                            context.drawImage(img, imgX, imgY, imgSize, imgSize);
                            context.restore();

                            context.save();
                            context.lineWidth = 2;
                            context.strokeStyle = '#ffffff';
                            context.beginPath();
                            context.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2, true);
                            context.stroke();
                            context.restore();
                        }
                    }

                    // 2. Group for combo pill (by Username + Gift Type)
                    const clusterKey = `${body.label}_${b.giftFile || 'unknown'}`;
                    const existing = clusteredBodies.get(clusterKey);

                    if (!existing) {
                        clusteredBodies.set(clusterKey, { body, count: 1 });
                    } else {
                        existing.count += 1;
                        if (body.position.y < existing.body.position.y) {
                            existing.body = body; // Attach label to the highest gift of this specific type
                        }
                    }
                }
            });

            // 3. Draw Combo Pills
            clusteredBodies.forEach(({ body, count }, clusterKey) => {
                const label = clusterKey.split('_')[0]; // Extract the username
                const textY = body.position.y - 95; // Positioned ABOVE the profile picture
                const displayText = count > 1 ? `${label} x${count}` : label;

                context.font = 'bold 16px "Exo 2", sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'middle';

                const textMetrics = context.measureText(displayText);
                const paddingX = 14;
                const pillWidth = textMetrics.width + (paddingX * 2);
                const pillHeight = 26;
                const pillX = body.position.x - (pillWidth / 2);
                const pillY = textY - (pillHeight / 2);

                // Draw Pill Background
                context.save();
                context.fillStyle = 'rgba(0, 0, 0, 0.8)';
                context.beginPath();
                context.roundRect(pillX, pillY, pillWidth, pillHeight, 13);
                context.fill();
                context.lineWidth = 1.5;
                context.strokeStyle = count > 1 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(255, 255, 255, 0.2)';
                context.stroke();
                context.restore();

                // Draw Combo Text
                context.save();
                context.fillStyle = count > 1 ? '#fde68a' : '#ffffff';
                context.shadowColor = 'rgba(0, 0, 0, 0.8)';
                context.shadowBlur = 4;
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 2;
                context.fillText(displayText, body.position.x, textY + 1);
                context.restore();
            });
        });

        const giftsSet = processedGifts.current;
        const pImages = profileImagesRef.current;

        return () => {
            Matter.Render.stop(currentRender);
            Matter.Runner.stop(runner);
            Matter.Engine.clear(currentEngine);
            currentRender.canvas.remove();
            giftsSet.clear(); // Required for React 18 StrictMode double-mount
            pImages.clear();
        };
    }, [setEditingEntity]);

    // Handle new gifts dropping — stagger on reload so they don't stack
    useEffect(() => {
        const cw = window.innerWidth;
        let staggerIndex = 0;

        droppedGifts.forEach((gift) => {
            if (processedGifts.current.has(gift.id)) return;
            processedGifts.current.add(gift.id);

            // Spread gifts across the screen width, stagger vertically but loop so they don't spawn above the ceiling
            const spawnX = cw * 0.1 + (staggerIndex * 120 + Math.random() * 60) % (cw * 0.8);
            const spawnY = -150 - ((staggerIndex % 5) * 90 + Math.random() * 50);
            staggerIndex++;

            const giftBody = Matter.Bodies.circle(spawnX, spawnY, PHYSICS_CONFIG.GIFT_SIZE / 2, {
                restitution: 0.5,
                friction: 0.1,
                label: gift.name,
                render: {
                    sprite: {
                        texture: `/gifts/${gift.giftFile}`,
                        xScale: 0.5,
                        yScale: 0.5,
                    }
                }
            });
            const b = giftBody as unknown as { donatorId: string, profilePictureUrl?: string, giftFile?: string };
            b.donatorId = gift.id;
            b.profilePictureUrl = gift.profilePictureUrl;
            b.giftFile = gift.giftFile;

            Matter.Composite.add(engine.current.world, giftBody);
        });
    }, [droppedGifts]);

    // Handle deleted gifts sync
    useEffect(() => {
        const bodies = Matter.Composite.allBodies(engine.current.world);
        const currentDonatorIds = new Set(donators.map(d => d.id));

        bodies.forEach(body => {
            const bodyDonatorId = (body as unknown as { donatorId?: string }).donatorId;
            if (bodyDonatorId && !currentDonatorIds.has(bodyDonatorId)) {
                Matter.Composite.remove(engine.current.world, body);
                processedGifts.current.delete(bodyDonatorId);
            }
        });
    }, [donators]);

    return (
        <div className="fixed inset-0 w-full h-full z-0 cursor-crosshair" ref={scene} />
    );
};

export default PhysicsJar;
