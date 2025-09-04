import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './game/GameManager.js';
import { MoveEvent, PlayerJoinEvent, PlayerLeaveEvent, PlayerMoveEvent, PaymentRequestEvent, PaymentResponseEvent, BalanceUpdateEvent } from './types/game.js';

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

  // Handle Ark address registration
  socket.on('registerArkAddress', (arkAddress: string) => {
    console.log(`Player ${socket.id} registered Ark address: ${arkAddress}`);
    gameManager.updatePlayerArkAddress(socket.id, arkAddress);
    
    // Notify all players about the Ark address update
    const playerMoveEvent: PlayerMoveEvent = {
      playerId: socket.id,
      x: 0, // These will be updated by the client
      y: 0
    };
    io.emit('playerArkAddressUpdated', { playerId: socket.id, arkAddress });
  });

  // Handle balance updates
  socket.on('balanceUpdate', (balanceUpdate: BalanceUpdateEvent) => {
    console.log(`Player ${balanceUpdate.playerId} balance updated: ${balanceUpdate.availableBalance} sats`);
    gameManager.updatePlayerBalance(balanceUpdate.playerId, balanceUpdate.availableBalance);
    
    // Notify all players about the balance update
    io.emit('balanceUpdated', balanceUpdate);
  });

  // Handle payment requests
  socket.on('paymentRequest', async (paymentRequest: PaymentRequestEvent) => {
    console.log(`Payment request from ${paymentRequest.fromPlayerId} to ${paymentRequest.toPlayerId} for ${paymentRequest.amount} sats`);
    
    try {
      // Get the target player's Ark address
      const targetPlayer = gameManager.getPlayer(paymentRequest.toPlayerId);
      if (!targetPlayer || !targetPlayer.arkAddress) {
        const errorResponse: PaymentResponseEvent = {
          success: false,
          error: 'Target player not found or has no Ark address',
          fromPlayerId: paymentRequest.fromPlayerId,
          toPlayerId: paymentRequest.toPlayerId,
          amount: paymentRequest.amount
        };
        socket.emit('paymentResponse', errorResponse);
        return;
      }

      // Forward the payment request to the target player
      const targetSocket = io.sockets.sockets.get(paymentRequest.toPlayerId);
      if (targetSocket) {
        targetSocket.emit('paymentRequest', {
          ...paymentRequest,
          targetArkAddress: targetPlayer.arkAddress
        });
      }

      // Send confirmation to the sender
      const successResponse: PaymentResponseEvent = {
        success: true,
        fromPlayerId: paymentRequest.fromPlayerId,
        toPlayerId: paymentRequest.toPlayerId,
        amount: paymentRequest.amount
      };
      socket.emit('paymentResponse', successResponse);

    } catch (error) {
      console.error('Payment request error:', error);
      const errorResponse: PaymentResponseEvent = {
        success: false,
        error: 'Payment request failed',
        fromPlayerId: paymentRequest.fromPlayerId,
        toPlayerId: paymentRequest.toPlayerId,
        amount: paymentRequest.amount
      };
      socket.emit('paymentResponse', errorResponse);
    }
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
