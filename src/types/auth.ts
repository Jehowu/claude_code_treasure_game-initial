export interface User {
  username: string;
  passwordHash: string;
  createdAt: number;
}

export interface GameRecord {
  score: number;
  timestamp: number;
}

export interface Session {
  username: string;
  isGuest: boolean;
}
