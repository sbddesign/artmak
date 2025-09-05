import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, MoveEvent, PlayerJoinEvent, PlayerLeaveEvent, PlayerMoveEvent, PaymentRequestEvent, PaymentResponseEvent, BalanceUpdateEvent } from '../types/game';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3002';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayer: null
  });
  const [connected, setConnected] = useState(false);
  const currentPlayerIdRef = useRef<string | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      currentPlayerIdRef.current = newSocket.id || null;
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('gameState', (state: GameState) => {
      setGameState({
        ...state,
        currentPlayer: state.players.find(p => p.id === currentPlayerIdRef.current) || null
      });
    });

    newSocket.on('playerJoined', (event: PlayerJoinEvent) => {
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, event.player],
        currentPlayer: event.player.id === currentPlayerIdRef.current ? event.player : prev.currentPlayer
      }));
    });

    newSocket.on('playerLeft', (event: PlayerLeaveEvent) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== event.playerId),
        currentPlayer: prev.currentPlayer?.id === event.playerId ? null : prev.currentPlayer
      }));
    });

    newSocket.on('playerMoved', (event: PlayerMoveEvent) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === event.playerId 
            ? { ...p, targetX: event.x, targetY: event.y, isMoving: true }
            : p
        ),
        currentPlayer: prev.currentPlayer?.id === event.playerId 
          ? { ...prev.currentPlayer, targetX: event.x, targetY: event.y, isMoving: true }
          : prev.currentPlayer
      }));
    });

    newSocket.on('playerArkAddressUpdated', (data: { playerId: string; arkAddress: string }) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === data.playerId 
            ? { ...p, arkAddress: data.arkAddress }
            : p
        ),
        currentPlayer: prev.currentPlayer?.id === data.playerId 
          ? { ...prev.currentPlayer, arkAddress: data.arkAddress }
          : prev.currentPlayer
      }));
    });

    newSocket.on('paymentRequest', (_paymentRequest: PaymentRequestEvent & { targetArkAddress?: string }) => {
      // This will be handled by the payment component
    });

    newSocket.on('paymentResponse', (_response: PaymentResponseEvent) => {
      // This will be handled by the payment component
    });

    newSocket.on('balanceUpdated', (event: BalanceUpdateEvent) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === event.playerId 
            ? { ...p, availableBalance: event.availableBalance }
            : p
        ),
        currentPlayer: prev.currentPlayer?.id === event.playerId 
          ? { ...prev.currentPlayer, availableBalance: event.availableBalance }
          : prev.currentPlayer
      }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const moveTo = (x: number, y: number) => {
    if (socket && connected && currentPlayerIdRef.current) {
      const moveEvent: MoveEvent = { x, y };
      socket.emit('move', moveEvent);
      // Let the server response handle the state update to avoid conflicts
    }
  };

  const registerArkAddress = (arkAddress: string) => {
    if (socket && connected) {
      socket.emit('registerArkAddress', arkAddress);
    }
  };

  const sendPaymentRequest = (toPlayerId: string, amount: number, message?: string) => {
    if (socket && connected && currentPlayerIdRef.current) {
      const paymentRequest: PaymentRequestEvent = {
        fromPlayerId: currentPlayerIdRef.current,
        toPlayerId,
        amount,
        message
      };
      socket.emit('paymentRequest', paymentRequest);
    }
  };

  const reportBalance = (availableBalance: number) => {
    if (socket && connected && currentPlayerIdRef.current) {
      const balanceUpdate: BalanceUpdateEvent = {
        playerId: currentPlayerIdRef.current,
        availableBalance
      };
      socket.emit('balanceUpdate', balanceUpdate);
    }
  };

  return {
    socket,
    gameState,
    connected,
    moveTo,
    registerArkAddress,
    sendPaymentRequest,
    reportBalance
  };
};
