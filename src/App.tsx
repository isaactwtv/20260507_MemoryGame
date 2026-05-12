/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Dog, Cat, Bird, Fish, Apple, Banana, TreePine, Moon, 
  Play, RotateCcw, AlertTriangle, Trophy, Timer, FlipHorizontal, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Game Constants
const INITIAL_TIME = 45;
const INITIAL_CHANCES = 20;
const BONUS_TIME = 15;

// Card Icons
const ICON_POOL = [
  { icon: Dog, color: 'text-orange-500' },
  { icon: Cat, color: 'text-yellow-500' },
  { icon: Bird, color: 'text-blue-500' },
  { icon: Fish, color: 'text-cyan-500' },
  { icon: Apple, color: 'text-red-500' },
  { icon: Banana, color: 'text-yellow-400' },
  { icon: TreePine, color: 'text-green-600' },
  { icon: Moon, color: 'text-purple-500' },
];

type CardData = {
  id: number;
  iconId: number;
  Icon: typeof Dog;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function App() {
  const [gameState, setGameState] = useState<'HOME' | 'PLAYING' | 'WON' | 'LOST'>('HOME');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [chances, setChances] = useState(INITIAL_CHANCES);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Game
  const initGame = useCallback(() => {
    const duplicatedIcons = [...ICON_POOL, ...ICON_POOL].map((item, index) => ({
      id: index,
      iconId: index % ICON_POOL.length,
      Icon: item.icon,
      color: item.color,
      isFlipped: false,
      isMatched: false,
    }));

    // Shuffle
    const shuffled = duplicatedIcons.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setTimeLeft(INITIAL_TIME);
    setChances(INITIAL_CHANCES);
    setFlippedCards([]);
    setGameState('PLAYING');
    setIsProcessing(false);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('LOST');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Win/Loss Condition Checks
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const allMatched = cards.every(card => card.isMatched);
      if (allMatched && cards.length > 0) {
        setGameState('WON');
      } else if (chances <= 0 && flippedCards.length === 0) {
        setGameState('LOST');
      }
    }
  }, [cards, gameState, chances, flippedCards]);

  // Handle Card Click
  const handleCardClick = (id: number) => {
    if (isProcessing || gameState !== 'PLAYING') return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    // Flip the card
    const updatedCards = cards.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const nextFlipped = [...flippedCards, id];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsProcessing(true);
      setChances(prev => prev - 1);
      
      const [firstId, secondId] = nextFlipped;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = updatedCards.find(c => c.id === secondId)!;

      if (firstCard.iconId === secondCard.iconId) {
        // Match Found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true } 
              : c
          ));
          setTimeLeft(prev => prev + BONUS_TIME);
          setFlippedCards([]);
          setIsProcessing(false);
        }, 600);
      } else {
        // Match Failed
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1500);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-natural-bg font-sans flex flex-col items-center justify-center p-4">
      {/* Landscape Warning Overlay */}
      <div 
        id="landscape-warning" 
        className="hidden fixed inset-0 z-50 bg-natural-bg text-natural-text flex-col items-center justify-center text-center p-8 space-y-4"
      >
        <AlertTriangle className="w-16 h-16 text-natural-earth animate-pulse" />
        <h2 className="text-2xl font-bold">請將裝置轉為直式</h2>
        <p className="text-natural-muted">此遊戲目前僅支援直式模式以獲得最佳體驗。</p>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'HOME' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="bg-white/90 backdrop-blur-sm p-10 rounded-[3rem] shadow-2xl border border-natural-sand max-w-lg w-full text-center space-y-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-natural-leaf/10 rounded-full blur-3xl opacity-50" />
              <div className="relative grid grid-cols-2 gap-4 bg-natural-bg p-6 rounded-2xl border border-natural-sand/50">
                 <Dog className="text-natural-earth w-12 h-12" />
                 <Cat className="text-yellow-600 w-12 h-12" />
                 <Apple className="text-red-600 w-12 h-12" />
                 <TreePine className="text-natural-leaf w-12 h-12" />
              </div>
            </div>
            
            <div>
              <h1 className="text-5xl font-extrabold text-natural-text tracking-tight mb-4">記憶翻牌遊戲</h1>
              <p className="text-natural-muted leading-relaxed text-lg">
                卡片圖案包含可愛的小動物與物品，<br />
                每當成功配對一對圖卡，將增加 <span className="text-natural-leaf font-bold">15秒</span> 的時間！
              </p>
            </div>

            <div className="bg-white/50 p-6 rounded-2xl text-left space-y-3 border border-natural-sand shadow-sm">
              <div className="flex items-center gap-3 text-lg text-natural-text font-medium">
                <Timer className="w-6 h-6 text-natural-leaf" /> 初始時間：45 秒
              </div>
              <div className="flex items-center gap-3 text-lg text-natural-text font-medium">
                <FlipHorizontal className="w-6 h-6 text-natural-earth" /> 配對機會：20 次
              </div>
              <div className="flex items-center gap-3 text-lg text-natural-text font-medium">
                <Heart className="w-6 h-6 text-red-500" /> 找出 8 對相同圖案即可獲勝
              </div>
            </div>

            <button
              id="start-game"
              onClick={initGame}
              className="w-full bg-natural-leaf hover:opacity-90 text-white font-bold py-6 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-2xl"
            >
              <Play fill="white" className="w-8 h-8" /> 開始遊戲
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl h-full flex flex-col py-4"
          >
            {/* Stats Bar */}
            <div className="flex justify-between items-center mb-6 px-2">
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-natural-sand flex items-center gap-4">
                <div className="bg-natural-earth/10 p-2.5 rounded-xl text-natural-earth">
                  <FlipHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-natural-muted font-bold uppercase tracking-wider mb-0.5">剩餘機會</div>
                  <div className="text-2xl font-bold text-natural-text leading-none">{chances}</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-natural-sand flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-natural-leaf/10 text-natural-leaf'}`}>
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-natural-muted font-bold uppercase tracking-wider mb-0.5">剩餘時間</div>
                  <div className={`text-2xl font-bold leading-none ${timeLeft <= 10 ? 'text-red-600' : 'text-natural-text'}`}>
                    {timeLeft}s
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Container with responsive scaling */}
            <div className="flex-grow flex items-center justify-center p-2">
              <div className="grid grid-cols-4 gap-3 sm:gap-5 w-full max-h-[60vh] aspect-square">
                {cards.map((card) => (
                  <div 
                    key={card.id}
                    className="perspective-1000 w-full h-full"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div className={`relative w-full h-full preserve-3d transition-transform duration-500 cursor-pointer ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                      {/* Front (Icon) */}
                      <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl sm:rounded-3xl shadow-md border-4 flex items-center justify-center p-3 sm:p-4 ${card.isMatched ? 'border-natural-leaf' : 'border-white'}`}>
                        <motion.div
                          animate={card.isMatched ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                        >
                          <card.Icon className={`w-10 h-10 sm:w-14 sm:h-14 ${card.color}`} />
                        </motion.div>
                        {card.isMatched && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 bg-natural-leaf text-white p-1.5 rounded-full border-2 border-white shadow-md"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                      </div>
                      {/* Back (Cover) */}
                      <div className="absolute inset-0 backface-hidden bg-natural-sand rounded-2xl sm:rounded-3xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                          <div className="grid grid-cols-4 grid-rows-4 w-full h-full">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className="border border-natural-text/10" />
                            ))}
                          </div>
                        </div>
                        <div className="text-natural-muted opacity-40 font-black text-2xl sm:text-4xl">?</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
               <button 
                onClick={() => setGameState('HOME')}
                className="text-natural-muted font-bold hover:text-natural-text flex items-center gap-2.5 transition-colors text-lg"
               >
                 <RotateCcw className="w-5 h-5" /> 放棄遊戲
               </button>
            </div>
          </motion.div>
        )}

        {(gameState === 'WON' || gameState === 'LOST') && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm p-12 rounded-[3.5rem] shadow-2xl border border-natural-sand max-w-lg w-full text-center space-y-10"
          >
            <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center ${gameState === 'WON' ? 'bg-natural-leaf/20 text-natural-leaf' : 'bg-natural-earth/20 text-natural-earth'}`}>
              {gameState === 'WON' ? <Trophy className="w-16 h-16" /> : <AlertTriangle className="w-16 h-16" />}
            </div>

            <div>
              <h2 className="text-5xl font-black text-natural-text tracking-tight mb-4">
                {gameState === 'WON' ? '配對大成功！' : '挑戰失敗...'}
              </h2>
              <p className="text-natural-muted text-xl">
                {gameState === 'WON' 
                  ? `太厲害了！你在還剩 ${timeLeft} 秒及 ${chances} 次機會時完成。` 
                  : chances <= 0 ? '機會已經用完。' : '時間已經歸零。'}
              </p>
            </div>

            <div className="space-y-4">
              <button
                id="play-again"
                onClick={initGame}
                className={`w-full font-bold py-6 rounded-3xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-2xl ${
                  gameState === 'WON' 
                  ? 'bg-natural-leaf text-white' 
                  : 'bg-natural-earth text-white'
                }`}
              >
                <RotateCcw className="w-8 h-8" /> 再戰一局
              </button>
              
              <button 
                onClick={() => setGameState('HOME')}
                className="w-full text-natural-muted font-bold hover:text-natural-text transition-colors text-xl"
              >
                回到主畫面
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
