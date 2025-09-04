export interface Player {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  isMoving: boolean;
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
