import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Player, MoveEvent, PlayerJoinEvent, PlayerLeaveEvent, PlayerMoveEvent } from '../types/game';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayer: null
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('gameState', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('playerJoined', (event: PlayerJoinEvent) => {
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, event.player]
      }));
    });

    newSocket.on('playerLeft', (event: PlayerLeaveEvent) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== event.playerId)
      }));
    });

    newSocket.on('playerMoved', (event: PlayerMoveEvent) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === event.playerId 
            ? { ...p, targetX: event.x, targetY: event.y, isMoving: true }
            : p
        )
      }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const moveTo = (x: number, y: number) => {
    if (socket && connected) {
      const moveEvent: MoveEvent = { x, y };
      socket.emit('move', moveEvent);
    }
  };

  return {
    socket,
    gameState,
    connected,
    moveTo
  };
};
