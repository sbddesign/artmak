import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './game/GameManager.js';
import { MoveEvent, PlayerJoinEvent, PlayerLeaveEvent, PlayerMoveEvent } from './types/game.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "https://artmak.atlbitlab.com",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;
const gameManager = new GameManager();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "https://artmak.atlbitlab.com",
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', players: gameManager.getGameState().players.length });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Add player to game
  const player = gameManager.addPlayer(socket.id);
  
  // Send current game state to the new player
  socket.emit('gameState', gameManager.getGameState());
  
  // Notify other players about the new player
  const playerJoinEvent: PlayerJoinEvent = { player };
  socket.broadcast.emit('playerJoined', playerJoinEvent);
  
  // Handle player movement
  socket.on('move', (moveEvent: MoveEvent) => {
    console.log(`Player ${socket.id} moving to (${moveEvent.x}, ${moveEvent.y})`);
    gameManager.movePlayer(socket.id, moveEvent);
    
    // Notify all players about the movement
    const playerMoveEvent: PlayerMoveEvent = {
      playerId: socket.id,
      x: moveEvent.x,
      y: moveEvent.y
    };
    io.emit('playerMoved', playerMoveEvent);
  });
  
  // Handle player position updates (for smooth movement)
  socket.on('positionUpdate', (data: { x: number; y: number }) => {
    gameManager.updatePlayerPosition(socket.id, data.x, data.y);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameManager.removePlayer(socket.id);
    
    // Notify other players about the player leaving
    const playerLeaveEvent: PlayerLeaveEvent = { playerId: socket.id };
    socket.broadcast.emit('playerLeft', playerLeaveEvent);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Game server ready for connections`);
  console.log(`📡 CORS enabled for: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
});
