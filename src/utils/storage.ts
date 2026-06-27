import type { User, GameRecord, Session } from '../types/auth';

const USERS_KEY = 'treasure_users';
const SESSION_KEY = 'treasure_session';
const SCORES_PREFIX = 'treasure_scores_';

export const hashPassword = async (password: string): Promise<string> => {
  const data = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const getUsers = (): User[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const findUser = (username: string): User | undefined =>
  getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());

export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getSession = (): Session | null => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

export const saveSession = (session: Session): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getUserScores = (username: string): GameRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(SCORES_PREFIX + username) || '[]');
  } catch {
    return [];
  }
};

export const saveGameRecord = (username: string, record: GameRecord): void => {
  const records = getUserScores(username);
  records.push(record);
  localStorage.setItem(SCORES_PREFIX + username, JSON.stringify(records));
};
