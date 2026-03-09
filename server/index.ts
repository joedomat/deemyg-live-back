import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { WebcastPushConnection } from 'tiktok-live-connector';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from the React frontend build
const frontendDist1 = path.join(__dirname, '../dist'); // if running from server/index.ts
const frontendDist2 = path.join(__dirname, '../../dist'); // if running from server/dist/index.js

const frontendPath = fs.existsSync(path.join(frontendDist1, 'index.html')) ? frontendDist1 : frontendDist2;

app.use(express.static(frontendPath));

// Fallback for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store active connections to cleanly disconnect when switching or dropping
const activeConnections = new Map<string, WebcastPushConnection>();

io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    let currentTiktokConnection: WebcastPushConnection | null = null;
    let currentUsername = '';

    socket.on('connect_tiktok', async (username: string) => {
        // Disconnect existing if any
        if (currentTiktokConnection) {
            console.log(`[TikTok] Disconnecting from ${currentUsername}`);
            currentTiktokConnection.disconnect();
            activeConnections.delete(currentUsername);
        }

        currentUsername = username;
        console.log(`[TikTok] Connecting to @${username}...`);

        // Notify frontend we are trying
        socket.emit('tiktok_status', { status: 'connecting', username });

        try {
            const tiktokConnection = new WebcastPushConnection(username, {
                processInitialData: false,
                enableExtendedGiftInfo: true,
                enableWebsocketUpgrade: true,
                requestPollingIntervalMs: 2000,
                clientParams: {
                    "app_language": "en-US",
                    "device_platform": "web"
                }
            });

            currentTiktokConnection = tiktokConnection;
            activeConnections.set(username, tiktokConnection);

            tiktokConnection.on('connected', (state) => {
                console.log(`[TikTok] Connected to @${username}`);

                // Extract the HLS stream URL if available
                const hlsUrl = state.roomInfo?.stream_url?.hls_pull_url;
                if (hlsUrl) {
                    console.log(`[TikTok] Stream URL found: ${hlsUrl}`);
                    socket.emit('tiktok_video_url', { url: hlsUrl });
                }

                socket.emit('tiktok_status', { status: 'connected', username, roomInfo: state });
            });

            tiktokConnection.on('disconnected', () => {
                console.log(`[TikTok] Disconnected from @${username}`);
                socket.emit('tiktok_status', { status: 'disconnected', username });
            });

            tiktokConnection.on('error', (err) => {
                console.error(`[TikTok] Error for @${username}:`, err.message);
                socket.emit('tiktok_error', { message: err.message });
            });

            // --- EVENTS TO RELAY TO FRONTEND ---

            // 1. Gifts
            tiktokConnection.on('gift', (data) => {
                console.log(`[TikTok] Gift received from ${data.uniqueId}: ${data.giftName} (Qty: ${data.repeatCount})`);
                socket.emit('tiktok_gift', {
                    userId: data.userId,
                    uniqueId: data.uniqueId,
                    nickname: data.nickname,
                    giftId: data.giftId,
                    giftName: data.giftName,
                    giftCount: data.repeatCount,
                    diamondCount: data.diamondCount,
                    // We can pass the URL just in case, though frontend uses local index.json
                    giftPictureUrl: data.giftPictureUrl,
                    profilePictureUrl: data.profilePictureUrl
                });
            });

            // 2. Follows
            tiktokConnection.on('follow', (data) => {
                console.log(`[TikTok] Follow from ${data.uniqueId}`);
                socket.emit('tiktok_follow', {
                    userId: data.userId,
                    uniqueId: data.uniqueId,
                    nickname: data.nickname
                });
            });

            // 3. Likes
            tiktokConnection.on('like', (data) => {
                console.log(`[TikTok] Like from ${data.uniqueId} (${data.likeCount} likes)`);
                socket.emit('tiktok_like', {
                    userId: data.userId,
                    uniqueId: data.uniqueId,
                    nickname: data.nickname,
                    likeCount: data.likeCount
                });
            });

            // 4. Chat
            tiktokConnection.on('chat', (data) => {
                console.log(`[TikTok] Chat from ${data.uniqueId}: ${data.comment}`);
                socket.emit('tiktok_chat', {
                    userId: data.userId,
                    uniqueId: data.uniqueId,
                    nickname: data.nickname,
                    comment: data.comment,
                    profilePictureUrl: data.profilePictureUrl
                });
            });

            // Attempt connection
            await tiktokConnection.connect();

        } catch (err: any) {
            console.error(`[TikTok] Failed to connect to @${username}`, err);
            socket.emit('tiktok_status', { status: 'error', username, message: err.message });
            currentTiktokConnection = null;
        }
    });

    socket.on('disconnect_tiktok', () => {
        if (currentTiktokConnection) {
            currentTiktokConnection.disconnect();
            activeConnections.delete(currentUsername);
            currentTiktokConnection = null;
            socket.emit('tiktok_status', { status: 'disconnected', username: currentUsername });
            currentUsername = '';
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
        if (currentTiktokConnection) {
            currentTiktokConnection.disconnect();
            activeConnections.delete(currentUsername);
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`[Server] TikTok Connector Backend running on port ${PORT}`);
});
