export interface Player {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  isMoving: boolean;
  arkAddress?: string;
}

export interface GameState {
  players: Player[];
  currentPlayer: Player | null;
}

export interface MoveEvent {
  x: number;
  y: number;
}

export interface PlayerJoinEvent {
  player: Player;
}

export interface PlayerLeaveEvent {
  playerId: string;
}

export interface PlayerMoveEvent {
  playerId: string;
  x: number;
  y: number;
}

export interface PaymentRequestEvent {
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  message?: string;
}

export interface PaymentResponseEvent {
  success: boolean;
  transactionId?: string;
  error?: string;
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
}
