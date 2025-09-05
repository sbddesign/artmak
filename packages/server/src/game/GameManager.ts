import { v4 as uuidv4 } from 'uuid';
import { Player, GameState, MoveEvent } from '../types/game.js';

export class GameManager {
  private players: Map<string, Player> = new Map();
  private gameState: GameState = {
    players: [],
    currentPlayer: null
  };

  private readonly colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  private getRandomColor(): string {
    const usedColors = Array.from(this.players.values()).map(p => p.color);
    const availableColors = this.colors.filter(color => !usedColors.includes(color));
    
    if (availableColors.length === 0) {
      // If all colors are used, pick a random one
      return this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }

  private getStartingPosition(): { x: number; y: number } {
    // All players start at origin (0, 0)
    // Client will transform this to their viewport center
    return {
      x: 0, // Origin X
      y: 0  // Origin Y
    };
  }

  addPlayer(socketId: string): Player {
    const position = this.getStartingPosition();
    const player: Player = {
      id: socketId,
      x: position.x,
      y: position.y,
      targetX: position.x,
      targetY: position.y,
      color: this.getRandomColor(),
      isMoving: false
    };

    this.players.set(socketId, player);
    this.updateGameState();
    
    return player;
  }

  removePlayer(socketId: string): void {
    this.players.delete(socketId);
    this.updateGameState();
  }

  movePlayer(socketId: string, moveEvent: MoveEvent): void {
    const player = this.players.get(socketId);
    if (player) {
      player.targetX = moveEvent.x;
      player.targetY = moveEvent.y;
      player.isMoving = true;
      this.players.set(socketId, player);
      this.updateGameState();
    }
  }

  updatePlayerPosition(socketId: string, x: number, y: number): void {
    const player = this.players.get(socketId);
    if (player) {
      player.x = x;
      player.y = y;
      
      // Check if player has reached target
      const distance = Math.sqrt(
        Math.pow(player.targetX - player.x, 2) + Math.pow(player.targetY - player.y, 2)
      );
      
      if (distance < 5) { // Close enough to target
        player.isMoving = false;
      }
      
      this.players.set(socketId, player);
      this.updateGameState();
    }
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getPlayer(socketId: string): Player | undefined {
    return this.players.get(socketId);
  }

  updatePlayerArkAddress(socketId: string, arkAddress: string): void {
    const player = this.players.get(socketId);
    if (player) {
      player.arkAddress = arkAddress;
      this.players.set(socketId, player);
      this.updateGameState();
    }
  }

  updatePlayerBalance(socketId: string, availableBalance: number): void {
    const player = this.players.get(socketId);
    if (player) {
      player.availableBalance = availableBalance;
      this.players.set(socketId, player);
      this.updateGameState();
    }
  }

  private updateGameState(): void {
    this.gameState.players = Array.from(this.players.values());
    // Don't set a current player on the server - each client tracks their own
    this.gameState.currentPlayer = null;
  }
}
