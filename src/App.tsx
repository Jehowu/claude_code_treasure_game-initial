import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import AuthScreen from './components/auth/AuthScreen';
import type { Session, GameRecord } from './types/auth';
import { getSession, clearSession, saveGameRecord, getUserScores } from './utils/storage';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import keyImage from './assets/key.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [userRecords, setUserRecords] = useState<GameRecord[]>([]);

  // Restore session from localStorage on mount
  useEffect(() => {
    setSession(getSession());
    setSessionChecked(true);
  }, []);

  // Load user's score history when session changes
  useEffect(() => {
    if (session && !session.isGuest) {
      setUserRecords(getUserScores(session.username));
    } else {
      setUserRecords([]);
    }
  }, [session]);

  // Initialize a new game whenever the user session is established
  useEffect(() => {
    if (session) initializeGame();
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save score when game ends (logged-in users only)
  useEffect(() => {
    if (gameEnded && session && !session.isGuest) {
      const record: GameRecord = { score, timestamp: Date.now() };
      saveGameRecord(session.username, record);
      setUserRecords(prev => [...prev, record]);
    }
  }, [gameEnded]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    setBoxes(
      Array.from({ length: 3 }, (_, index) => ({
        id: index,
        isOpen: false,
        hasTreasure: index === treasureBoxIndex,
      }))
    );
    setScore(0);
    setGameEnded(false);
  };

  const handleAuth = (newSession: Session) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    const box = boxes.find(b => b.id === boxId);
    if (!box || box.isOpen) return;

    new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();

    const scoreChange = box.hasTreasure ? 100 : -50;
    setScore(prev => prev + scoreChange);

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(b =>
        b.id === boxId && !b.isOpen ? { ...b, isOpen: true } : b
      );

      const treasureFound = updatedBoxes.some(b => b.isOpen && b.hasTreasure);
      const allOpened = updatedBoxes.every(b => b.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  // Don't render until we know the session state
  if (!sessionChecked) return null;

  // Show auth screen when not logged in
  if (!session) return <AuthScreen onAuth={handleAuth} />;

  const bestScore = userRecords.length > 0
    ? Math.max(...userRecords.map(r => r.score))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">

      {/* User info bar */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {session.isGuest ? (
          <>
            <span className="text-amber-700 text-sm">👤 訪客模式</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-amber-400 text-amber-700 hover:bg-amber-100 text-sm h-8 px-3"
            >
              登入 / 註冊
            </Button>
          </>
        ) : (
          <>
            <div className="text-right">
              <div className="text-amber-900 font-medium text-sm">👤 {session.username}</div>
              {bestScore !== null && (
                <div className="text-amber-600 text-xs">🏆 最高分：${bestScore}</div>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-amber-400 text-amber-700 hover:bg-amber-100 text-sm h-8 px-3"
            >
              登出
            </Button>
          </>
        )}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$100 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className={`flex flex-col items-center ${!box.isOpen ? 'cursor-pointer' : ''}`}
            style={!box.isOpen ? { cursor: `url(${keyImage}) 0 0, pointer` } : undefined}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <img
                src={box.isOpen
                  ? (box.hasTreasure ? treasureChest : skeletonChest)
                  : closedChest
                }
                alt={box.isOpen
                  ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                  : "Treasure Chest"
                }
                className="w-48 h-48 object-contain drop-shadow-lg"
              />

              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$100' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">
                  Click to open!
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score:{' '}
              <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {!session.isGuest && userRecords.length > 0 && (
              <p className="text-sm text-amber-700 mt-1">
                🏆 你的最高分：${Math.max(...userRecords.map(r => r.score))}
              </p>
            )}
            {session.isGuest && (
              <p className="text-xs text-amber-500 mt-2">
                登入後可儲存你的分數！
              </p>
            )}
          </div>

          <Button
            onClick={initializeGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
