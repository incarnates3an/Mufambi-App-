
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Coins, TrendingUp, AlertTriangle, Play, Trophy, Skull, BrainCircuit, Terminal, Activity, Zap, Grid3x3, Box, ChevronRight, Target, Layers } from 'lucide-react';

interface ArcadeProps {
  points: number;
  onUpdatePoints: (newPoints: number) => void;
  addNotification: (msg: string) => void;
}

type GameMode = 'REFLEX' | 'SEQUENCE' | 'BYPASS' | 'SNAKE' | '2048' | 'BREAKOUT' | 'MEMORY' | 'RUNNER' | 'IDLE';
type Difficulty = 'HARD' | 'EXTREME';

interface Position { x: number; y: number; }
interface Brick { x: number; y: number; hits: number; color: string; }
interface Card { id: number; value: number; flipped: boolean; matched: boolean; }

const Arcade: React.FC<ArcadeProps> = ({ points, onUpdatePoints, addNotification }) => {
  const [mode, setMode] = useState<GameMode>('IDLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('HARD');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);

  // Common game states
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [bypassGrid, setBypassGrid] = useState<{ type: 'SAFE' | 'DANGER', active: boolean }[][]>([]);
  const [bypassRow, setBypassRow] = useState(0);

  // SNAKE game states
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [snakeFood, setSnakeFood] = useState<Position>({ x: 15, y: 15 });
  const [snakeDirection, setSnakeDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [snakeSpeed, setSnakeSpeed] = useState(150);

  // 2048 game states
  const [grid2048, setGrid2048] = useState<number[][]>([]);
  const [highestTile, setHighestTile] = useState(0);

  // BREAKOUT game states
  const [paddleX, setPaddleX] = useState(50);
  const [ball, setBall] = useState({ x: 50, y: 70, dx: 2, dy: -2 });
  const [bricks, setBricks] = useState<Brick[]>([]);

  // MEMORY game states
  const [memoryCards, setMemoryCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);

  // RUNNER game states
  const [runnerY, setRunnerY] = useState(50);
  const [runnerVelocity, setRunnerVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<Position[]>([]);
  const [runnerDistance, setRunnerDistance] = useState(0);

  const gameLoopRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const STATS = {
    HARD: { fee: 50, reward: 200, penalty: 0 },
    EXTREME: { fee: 250, reward: 2000, penalty: 150 }
  };

  const startGame = (gameMode: GameMode, diff: Difficulty) => {
    const cost = STATS[diff].fee;
    if (points < cost) {
      addNotification("CRITICAL: Insufficient Credits for Neural Link.");
      return;
    }

    onUpdatePoints(points - cost);
    setMode(gameMode);
    setDifficulty(diff);
    setGameState('PLAYING');
    setScore(0);

    switch (gameMode) {
      case 'REFLEX': startReflexGame(diff); break;
      case 'SEQUENCE': startSequenceGame(diff); break;
      case 'BYPASS': startBypassGame(diff); break;
      case 'SNAKE': startSnakeGame(diff); break;
      case '2048': start2048Game(diff); break;
      case 'BREAKOUT': startBreakoutGame(diff); break;
      case 'MEMORY': startMemoryGame(diff); break;
      case 'RUNNER': startRunnerGame(diff); break;
    }
  };

  // ============= IMPROVED REFLEX GAME =============
  const startReflexGame = (diff: Difficulty) => {
    const timeLimit = diff === 'HARD' ? 10 : 7;
    setTimer(timeLimit);
    spawnTarget();
  };

  const spawnTarget = () => {
    setTargetPos({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80
    });
  };

  const handleTargetClick = () => {
    if (gameState !== 'PLAYING') return;
    const newScore = score + 1;
    setScore(newScore);
    const targetScore = difficulty === 'HARD' ? 25 : 40;
    if (newScore >= targetScore) endGame(true);
    else spawnTarget();
  };

  // ============= IMPROVED SEQUENCE GAME =============
  const startSequenceGame = (diff: Difficulty) => {
    const len = diff === 'HARD' ? 8 : 12;
    const newSeq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setUserSequence([]);
    playSequence(newSeq, diff);
  };

  const playSequence = async (seq: number[], diff: Difficulty) => {
    const speed = diff === 'HARD' ? 500 : 300;
    for (const pad of seq) {
      await new Promise(r => setTimeout(r, speed));
      setActivePad(pad);
      await new Promise(r => setTimeout(r, speed / 2));
      setActivePad(null);
    }
  };

  const handlePadClick = (idx: number) => {
    if (gameState !== 'PLAYING' || activePad !== null) return;
    const expected = sequence[userSequence.length];
    if (idx === expected) {
      const newSeq = [...userSequence, idx];
      setUserSequence(newSeq);
      setActivePad(idx);
      setTimeout(() => setActivePad(null), 150);
      if (newSeq.length === sequence.length) endGame(true);
    } else {
      endGame(false);
    }
  };

  // ============= IMPROVED BYPASS GAME =============
  const startBypassGame = (diff: Difficulty) => {
    const rows = diff === 'HARD' ? 12 : 18;
    const cols = diff === 'HARD' ? 3 : 5;
    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        type: Math.random() > 0.65 ? 'DANGER' : 'SAFE' as any,
        active: false
      }))
    );
    setBypassGrid(grid);
    setBypassRow(0);
  };

  const handleBypassTap = (row: number, col: number) => {
    if (gameState !== 'PLAYING' || row !== bypassRow) return;
    if (bypassGrid[row][col].type === 'DANGER') {
      endGame(false);
    } else {
      const nextRow = bypassRow + 1;
      if (nextRow >= bypassGrid.length) {
        endGame(true);
      } else {
        setBypassRow(nextRow);
      }
    }
  };

  // ============= NEW: SNAKE GAME =============
  const startSnakeGame = (diff: Difficulty) => {
    const gridSize = diff === 'HARD' ? 15 : 20;
    const startPos = Math.floor(gridSize / 2);
    setSnake([{ x: startPos, y: startPos }]);
    setSnakeDirection('RIGHT');
    setSnakeSpeed(diff === 'HARD' ? 180 : 120);
    setSnakeFood(generateFood([{ x: startPos, y: startPos }], gridSize));
    setScore(0);
  };

  const generateFood = (snakeBody: Position[], gridSize: number): Position => {
    let food: Position;
    do {
      food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    } while (snakeBody.some(seg => seg.x === food.x && seg.y === food.y));
    return food;
  };

  const handleSnakeDirection = (newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opposite[snakeDirection as keyof typeof opposite] !== newDir) {
      setSnakeDirection(newDir);
    }
  };

  // ============= NEW: 2048 GAME =============
  const start2048Game = (diff: Difficulty) => {
    const size = diff === 'HARD' ? 4 : 5;
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid2048(newGrid);
    setHighestTile(2);
    setScore(0);
  };

  const addRandomTile = (grid: number[][]) => {
    const emptyCells: Position[] = [];
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 0) emptyCells.push({ x, y });
      });
    });
    if (emptyCells.length > 0) {
      const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[y][x] = Math.random() > 0.9 ? 4 : 2;
    }
  };

  const move2048 = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameState !== 'PLAYING') return;

    const newGrid = grid2048.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const compress = (line: number[]) => line.filter(cell => cell !== 0);
    const merge = (line: number[]) => {
      const result: number[] = [];
      for (let i = 0; i < line.length; i++) {
        if (line[i] === line[i + 1] && line[i] !== 0) {
          result.push(line[i] * 2);
          newScore += line[i] * 2;
          i++;
        } else {
          result.push(line[i]);
        }
      }
      return result;
    };

    const processLine = (line: number[]) => {
      const compressed = compress(line);
      const merged = merge(compressed);
      while (merged.length < line.length) merged.push(0);
      return merged;
    };

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let y = 0; y < newGrid.length; y++) {
        const row = direction === 'LEFT' ? newGrid[y] : newGrid[y].reverse();
        const processed = processLine(row);
        if (direction === 'RIGHT') processed.reverse();
        if (JSON.stringify(newGrid[y]) !== JSON.stringify(processed)) moved = true;
        newGrid[y] = processed;
      }
    } else {
      for (let x = 0; x < newGrid[0].length; x++) {
        const col = newGrid.map(row => row[x]);
        const toProcess = direction === 'UP' ? col : col.reverse();
        const processed = processLine(toProcess);
        if (direction === 'DOWN') processed.reverse();
        if (JSON.stringify(col) !== JSON.stringify(processed)) moved = true;
        processed.forEach((val, y) => newGrid[y][x] = val);
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid2048(newGrid);
      setScore(newScore);

      const maxTile = Math.max(...newGrid.flat());
      setHighestTile(maxTile);

      if (maxTile >= (difficulty === 'HARD' ? 2048 : 4096)) {
        endGame(true);
      } else if (!canMove(newGrid)) {
        endGame(false);
      }
    }
  };

  const canMove = (grid: number[][]): boolean => {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        if (grid[y][x] === 0) return true;
        if (x < grid[0].length - 1 && grid[y][x] === grid[y][x + 1]) return true;
        if (y < grid.length - 1 && grid[y][x] === grid[y + 1][x]) return true;
      }
    }
    return false;
  };

  // ============= NEW: BREAKOUT GAME =============
  const startBreakoutGame = (diff: Difficulty) => {
    const rows = diff === 'HARD' ? 5 : 7;
    const cols = diff === 'HARD' ? 6 : 8;
    const newBricks: Brick[] = [];
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        newBricks.push({
          x: x * (100 / cols),
          y: y * 6 + 5,
          hits: diff === 'EXTREME' ? 2 : 1,
          color: colors[y % colors.length]
        });
      }
    }

    setBricks(newBricks);
    setPaddleX(50);
    setBall({ x: 50, y: 70, dx: 2.5, dy: -2.5 });
    setScore(0);
  };

  // ============= NEW: MEMORY CARD GAME =============
  const startMemoryGame = (diff: Difficulty) => {
    const pairs = diff === 'HARD' ? 6 : 10;
    const values = Array.from({ length: pairs }, (_, i) => i);
    const cards = [...values, ...values]
      .sort(() => Math.random() - 0.5)
      .map((value, id) => ({ id, value, flipped: false, matched: false }));

    setMemoryCards(cards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setScore(0);
  };

  const handleCardFlip = (id: number) => {
    if (flippedCards.length === 2 || memoryCards[id].matched || flippedCards.includes(id)) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (memoryCards[first].value === memoryCards[second].value) {
        const newCards = [...memoryCards];
        newCards[first].matched = true;
        newCards[second].matched = true;
        setMemoryCards(newCards);
        setMatchedPairs(matchedPairs + 1);
        setFlippedCards([]);
        setScore(score + 100);

        if (matchedPairs + 1 === memoryCards.length / 2) {
          setTimeout(() => endGame(true), 500);
        }
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  // ============= NEW: RUNNER GAME =============
  const startRunnerGame = (diff: Difficulty) => {
    setRunnerY(50);
    setRunnerVelocity(0);
    setObstacles([]);
    setRunnerDistance(0);
    setScore(0);
  };

  const jumpRunner = () => {
    if (runnerY >= 50) {
      setRunnerVelocity(-8);
    }
  };

  // Game loop effects
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    if (mode === 'REFLEX' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 0.1) {
            endGame(false);
            return 0;
          }
          return t - 0.1;
        });
      }, 100);
      return () => clearInterval(interval);
    }

    if (mode === 'SNAKE') {
      const interval = setInterval(() => {
        setSnake(prevSnake => {
          const head = prevSnake[0];
          const gridSize = difficulty === 'HARD' ? 15 : 20;
          let newHead = { ...head };

          switch (snakeDirection) {
            case 'UP': newHead.y -= 1; break;
            case 'DOWN': newHead.y += 1; break;
            case 'LEFT': newHead.x -= 1; break;
            case 'RIGHT': newHead.x += 1; break;
          }

          // Check wall collision
          if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
            endGame(false);
            return prevSnake;
          }

          // Check self collision
          if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            endGame(false);
            return prevSnake;
          }

          const newSnake = [newHead, ...prevSnake];

          // Check food collision
          if (newHead.x === snakeFood.x && newHead.y === snakeFood.y) {
            setSnakeFood(generateFood(newSnake, gridSize));
            setScore(s => s + 10);
            const targetScore = difficulty === 'HARD' ? 100 : 150;
            if (score + 10 >= targetScore) endGame(true);
            return newSnake;
          }

          newSnake.pop();
          return newSnake;
        });
      }, snakeSpeed);
      return () => clearInterval(interval);
    }

    if (mode === 'BREAKOUT') {
      const interval = setInterval(() => {
        setBall(prevBall => {
          let newBall = { ...prevBall };
          newBall.x += newBall.dx;
          newBall.y += newBall.dy;

          // Wall collisions
          if (newBall.x <= 0 || newBall.x >= 100) newBall.dx *= -1;
          if (newBall.y <= 0) newBall.dy *= -1;

          // Paddle collision
          if (newBall.y >= 68 && newBall.y <= 72 && Math.abs(newBall.x - paddleX) < 10) {
            newBall.dy *= -1;
            const offset = (newBall.x - paddleX) / 10;
            newBall.dx = offset * 3;
          }

          // Brick collisions
          setBricks(prevBricks => {
            const newBricks = prevBricks.filter(brick => {
              const hit = newBall.x >= brick.x && newBall.x <= brick.x + (100 / (difficulty === 'HARD' ? 6 : 8)) &&
                          newBall.y >= brick.y && newBall.y <= brick.y + 5;
              if (hit) {
                newBall.dy *= -1;
                setScore(s => s + 10);
                return brick.hits > 1 ? (brick.hits--, true) : false;
              }
              return true;
            });

            if (newBricks.length === 0) {
              endGame(true);
            }
            return newBricks;
          });

          // Ball out of bounds
          if (newBall.y > 100) {
            endGame(false);
          }

          return newBall;
        });
      }, 30);
      return () => clearInterval(interval);
    }

    if (mode === 'RUNNER') {
      const interval = setInterval(() => {
        setRunnerVelocity(v => v + 0.5); // Gravity
        setRunnerY(y => Math.min(y + runnerVelocity, 50));
        setRunnerDistance(d => d + 1);
        setScore(s => s + 1);

        setObstacles(prev => {
          const newObstacles = prev.map(obs => ({ ...obs, x: obs.x - 2 })).filter(obs => obs.x > -10);
          if (Math.random() < 0.02) {
            newObstacles.push({ x: 100, y: 50 });
          }

          // Check collision
          newObstacles.forEach(obs => {
            if (obs.x >= 10 && obs.x <= 20 && runnerY >= 40) {
              endGame(false);
            }
          });

          const targetScore = difficulty === 'HARD' ? 300 : 500;
          if (score + 1 >= targetScore) endGame(true);

          return newObstacles;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState, mode, timer, snakeDirection, snakeSpeed, runnerVelocity, runnerY, score]);

  // Touch controls for 2048
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (mode !== '2048' || gameState !== 'PLAYING') return;
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || mode !== '2048') return;
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        move2048(deltaX > 0 ? 'RIGHT' : 'LEFT');
      } else {
        move2048(deltaY > 0 ? 'DOWN' : 'UP');
      }
      touchStartRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mode, gameState, grid2048]);

  const endGame = (won: boolean) => {
    setGameState(won ? 'WON' : 'LOST');
    const stats = STATS[difficulty];
    if (won) {
      onUpdatePoints(points + stats.reward);
      addNotification(`LINK SUCCESS: +${stats.reward} PTS`);
    } else {
      if (difficulty === 'EXTREME') {
        onUpdatePoints(Math.max(0, points - stats.penalty));
        addNotification(`SYSTEM BACKLASH: -${stats.penalty} PTS`);
      } else {
        addNotification(`LINK TERMINATED: Fee Forfeited.`);
      }
    }
  };

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: 'bg-gray-700', 4: 'bg-gray-600', 8: 'bg-orange-600', 16: 'bg-orange-500',
      32: 'bg-red-600', 64: 'bg-red-500', 128: 'bg-yellow-600', 256: 'bg-yellow-500',
      512: 'bg-yellow-400', 1024: 'bg-amber-500', 2048: 'bg-amber-400', 4096: 'bg-purple-600'
    };
    return colors[value] || 'bg-purple-500';
  };

  const cardEmojis = ['🚗', '🏙️', '⚡', '🎯', '🌟', '🔥', '💎', '🚀', '🎮', '🏆'];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto scroll-hide space-y-6 bg-[#050505] relative">
      {gameState === 'IDLE' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-gradient-to-br from-red-950/60 to-[#0f0f12] p-6 rounded-[2.5rem] border border-red-500/30 shadow-2xl relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-600/10 blur-2xl rounded-full"></div>
             <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500 w-5 h-5 animate-pulse" />
                <h4 className="text-white font-black uppercase text-sm italic tracking-widest">High-Risk Engagement</h4>
             </div>
             <p className="text-[10px] text-red-200/80 font-black uppercase tracking-widest leading-relaxed italic">
               Extreme Protocol: Failure causes <strong className="text-red-500">Neural Backlash (-150 PTS)</strong>. Rewards are scaled to risk.
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GameCard
              title="Snake Hunt"
              desc="Collect data nodes without collision"
              hardFee={STATS.HARD.fee}
              extremeFee={STATS.EXTREME.fee}
              onHard={() => startGame('SNAKE', 'HARD')}
              onExtreme={() => startGame('SNAKE', 'EXTREME')}
              icon={<Grid3x3 className="w-5 h-5" />}
              color="text-green-500"
            />
            <GameCard
              title="2048 Grid"
              desc="Merge tiles to reach target value"
              hardFee={STATS.HARD.fee}
              extremeFee={STATS.EXTREME.fee}
              onHard={() => startGame('2048', 'HARD')}
              onExtreme={() => startGame('2048', 'EXTREME')}
              icon={<Box className="w-5 h-5" />}
              color="text-amber-500"
            />
            <GameCard
              title="Neural Reflex"
              desc="Intercept data packets at high velocity"
              hardFee={STATS.HARD.fee}
              extremeFee={STATS.EXTREME.fee}
              onHard={() => startGame('REFLEX', 'HARD')}
              onExtreme={() => startGame('REFLEX', 'EXTREME')}
              icon={<Activity className="w-5 h-5" />}
              color="text-indigo-500"
            />
            <GameCard
              title="Breakout"
              desc="Destroy firewall blocks with precision"
              hardFee={STATS.HARD.fee}
              extremeFee={STATS.EXTREME.fee}
              onHard={() => startGame('BREAKOUT', 'HARD')}
              onExtreme={() => startGame('BREAKOUT', 'EXTREME')}
              icon={<Layers className="w-5 h-5" />}
              color="text-blue-500"
            />
            <GameCard
              title="Memory Match"
              desc="Link matching neural patterns"
              hardFee={STATS.HARD.fee}
              extremeFee={STATS.EXTREME.fee}
              onHard={() => startGame('MEMORY', 'HARD')}
              onExtreme={() => startGame('MEMORY', 'EXTREME')}
              icon={<BrainCircuit className="w-5 h-5" />}
              color="text-purple-500"
            />
            <GameCard
              title="Quantum Sequence"
              desc="Reconstruct glitched neural patterns"
              hardFee={STATS.HARD.fee}
              extremeFee={STATS.EXTREME.fee}
              onHard={() => startGame('SEQUENCE', 'HARD')}
              onExtreme={() => startGame('SEQUENCE', 'EXTREME')}
              icon={<BrainCircuit className="w-5 h-5" />}
              color="text-cyan-500"
            />
            <GameCard
              title="Grid Bypass"
              desc="Navigate through collapsing firewall"
              hardFee={STATS.HARD.fee}
              extremeFee={STATS.EXTREME.fee}
              onHard={() => startGame('BYPASS', 'HARD')}
              onExtreme={() => startGame('BYPASS', 'EXTREME')}
              icon={<Terminal className="w-5 h-5" />}
              color="text-emerald-500"
            />
            <GameCard
              title="Nano Runner"
              desc="Dodge obstacles in endless terrain"
              hardFee={STATS.HARD.fee}
              extremeFee={STATS.EXTREME.fee}
              onHard={() => startGame('RUNNER', 'HARD')}
              onExtreme={() => startGame('RUNNER', 'EXTREME')}
              icon={<Zap className="w-5 h-5" />}
              color="text-yellow-500"
            />
          </div>
        </div>
      )}

      {/* SNAKE GAME */}
      {gameState === 'PLAYING' && mode === 'SNAKE' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-full flex justify-between px-2">
            <div className="text-white"><p className="text-[8px] font-black uppercase text-gray-500">Score</p><p className="text-xl font-black italic">{score}</p></div>
            <div className="flex gap-2">
              <button onClick={() => handleSnakeDirection('UP')} className="p-3 bg-indigo-600 rounded-xl active:scale-95">↑</button>
            </div>
          </div>
          <div className="grid gap-0.5 bg-white/10 p-1 rounded-2xl" style={{ gridTemplateColumns: `repeat(${difficulty === 'HARD' ? 15 : 20}, 1fr)` }}>
            {Array.from({ length: (difficulty === 'HARD' ? 15 : 20) * (difficulty === 'HARD' ? 15 : 20) }).map((_, idx) => {
              const gridSize = difficulty === 'HARD' ? 15 : 20;
              const x = idx % gridSize;
              const y = Math.floor(idx / gridSize);
              const isSnake = snake.some(seg => seg.x === x && seg.y === y);
              const isHead = snake[0]?.x === x && snake[0]?.y === y;
              const isFood = snakeFood.x === x && snakeFood.y === y;
              return (
                <div key={idx} className={`aspect-square rounded-sm ${
                  isHead ? 'bg-indigo-600 shadow-lg' :
                  isSnake ? 'bg-indigo-500' :
                  isFood ? 'bg-red-500 animate-pulse' :
                  'bg-black/40'
                }`} />
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSnakeDirection('LEFT')} className="p-3 bg-indigo-600 rounded-xl active:scale-95">←</button>
            <button onClick={() => handleSnakeDirection('DOWN')} className="p-3 bg-indigo-600 rounded-xl active:scale-95">↓</button>
            <button onClick={() => handleSnakeDirection('RIGHT')} className="p-3 bg-indigo-600 rounded-xl active:scale-95">→</button>
          </div>
        </div>
      )}

      {/* 2048 GAME */}
      {gameState === 'PLAYING' && mode === '2048' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-full flex justify-between px-2">
            <div className="text-white"><p className="text-[8px] font-black uppercase text-gray-500">Score</p><p className="text-xl font-black italic">{score}</p></div>
            <div className="text-white"><p className="text-[8px] font-black uppercase text-gray-500">Best</p><p className="text-xl font-black italic">{highestTile}</p></div>
          </div>
          <div className="grid gap-2 bg-[#0f0f12] p-4 rounded-2xl" style={{ gridTemplateColumns: `repeat(${grid2048.length}, 1fr)` }}>
            {grid2048.flat().map((val, idx) => (
              <div key={idx} className={`aspect-square rounded-xl flex items-center justify-center text-white font-black transition-all ${val ? getTileColor(val) + ' scale-100' : 'bg-black/40 scale-95'}`}>
                {val || ''}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
            <div></div>
            <button onClick={() => move2048('UP')} className="p-4 bg-indigo-600 rounded-xl active:scale-95 font-black">↑</button>
            <div></div>
            <button onClick={() => move2048('LEFT')} className="p-4 bg-indigo-600 rounded-xl active:scale-95 font-black">←</button>
            <button onClick={() => move2048('DOWN')} className="p-4 bg-indigo-600 rounded-xl active:scale-95 font-black">↓</button>
            <button onClick={() => move2048('RIGHT')} className="p-4 bg-indigo-600 rounded-xl active:scale-95 font-black">→</button>
          </div>
        </div>
      )}

      {/* BREAKOUT GAME */}
      {gameState === 'PLAYING' && mode === 'BREAKOUT' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-full px-2"><p className="text-[8px] font-black uppercase text-gray-500">Score</p><p className="text-xl font-black italic text-white">{score}</p></div>
          <div className="w-full aspect-[3/4] bg-[#0f0f12] rounded-2xl border border-white/10 relative overflow-hidden">
            {bricks.map((brick, idx) => (
              <div key={idx} style={{ left: `${brick.x}%`, top: `${brick.y}%`, width: `${100/(difficulty==='HARD'?6:8)}%`, height: '5%' }} className={`absolute rounded opacity-${brick.hits * 50}`}
              style={{ backgroundColor: brick.color, left: `${brick.x}%`, top: `${brick.y}%`, width: `${100/(difficulty==='HARD'?6:8)}%`, height: '5%' }} />
            ))}
            <div style={{ left: `${paddleX}%`, top: '70%' }} className="absolute w-20 h-2 bg-white rounded-full transform -translate-x-1/2" />
            <div style={{ left: `${ball.x}%`, top: `${ball.y}%` }} className="absolute w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
          </div>
          <input type="range" min="10" max="90" value={paddleX} onChange={(e) => setPaddleX(Number(e.target.value))} className="w-full" />
        </div>
      )}

      {/* MEMORY GAME */}
      {gameState === 'PLAYING' && mode === 'MEMORY' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-full px-2"><p className="text-[8px] font-black uppercase text-gray-500">Pairs Found</p><p className="text-xl font-black italic text-white">{matchedPairs} / {memoryCards.length/2}</p></div>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${difficulty==='HARD'?3:4}, 1fr)` }}>
            {memoryCards.map(card => (
              <button key={card.id} onClick={() => handleCardFlip(card.id)}
                className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all ${
                  card.matched ? 'bg-green-600/20 border-green-500' :
                  flippedCards.includes(card.id) ? 'bg-indigo-600 border-indigo-400' :
                  'bg-[#0f0f12] border-white/10'
                } border-2`}>
                {(card.matched || flippedCards.includes(card.id)) ? cardEmojis[card.value] : '?'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RUNNER GAME */}
      {gameState === 'PLAYING' && mode === 'RUNNER' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4" onClick={jumpRunner}>
          <div className="w-full px-2"><p className="text-[8px] font-black uppercase text-gray-500">Distance</p><p className="text-xl font-black italic text-white">{score}</p></div>
          <div className="w-full h-48 bg-[#0f0f12] rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
            <div style={{ left: '10%', bottom: `${runnerY}%` }} className="absolute w-8 h-8 bg-indigo-600 rounded-lg" />
            {obstacles.map((obs, idx) => (
              <div key={idx} style={{ left: `${obs.x}%`, bottom: '0' }} className="absolute w-6 h-12 bg-red-600 rounded" />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase text-gray-500">Tap to Jump</p>
        </div>
      )}

      {/* REFLEX GAME */}
      {gameState === 'PLAYING' && mode === 'REFLEX' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-300">
          <div className="w-full flex justify-between px-2">
             <div className="text-white"><p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Hits</p><p className="text-xl font-black italic">{score} / {difficulty==='HARD'?25:40}</p></div>
             <div className="text-right"><p className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500">Time</p><p className="text-xl font-black italic text-red-500">{timer.toFixed(1)}s</p></div>
          </div>
          <div className="w-full aspect-square bg-[#0f0f12] rounded-[3rem] border border-white/10 relative shadow-2xl overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)]"></div>
             <button
               onClick={handleTargetClick}
               className="absolute w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.9)] border-4 border-white animate-pulse transition-all active:scale-90"
               style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, transform: 'translate(-50%, -50%)' }}
             />
          </div>
        </div>
      )}

      {/* SEQUENCE GAME */}
      {gameState === 'PLAYING' && mode === 'SEQUENCE' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in">
          <div className="text-center">
             <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic animate-pulse mb-2">Synchronizing Pattern...</p>
             <p className="text-sm font-black text-white italic uppercase tracking-tighter">{userSequence.length} / {sequence.length} Links Formed</p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full aspect-square p-4">
            {[0, 1, 2, 3].map(idx => (
              <button
                key={idx}
                onClick={() => handlePadClick(idx)}
                className={`rounded-[2.5rem] border-4 transition-all ${
                  activePad === idx
                    ? 'bg-cyan-600 border-white scale-100 shadow-[0_0_60px_rgba(6,182,212,1)]'
                    : 'bg-[#1a1a1f] border-white/5 active:bg-gray-800 scale-95'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* BYPASS GAME */}
      {gameState === 'PLAYING' && mode === 'BYPASS' && (
        <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase text-green-500 animate-pulse tracking-widest">Bypassing Firewall...</span>
              <span className="text-[10px] font-black text-white italic">{bypassRow} / {bypassGrid.length} Layers</span>
           </div>
           <div className="w-full space-y-2">
              {bypassGrid.slice(Math.max(0, bypassRow - 2), bypassRow + 5).map((row, rIdx) => (
                <div key={rIdx} className={`grid gap-2 w-full`} style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                  {row.map((col, cIdx) => {
                    const actualRow = Math.max(0, bypassRow - 2) + rIdx;
                    const isCurrent = actualRow === bypassRow;
                    return (
                      <button
                        key={cIdx}
                        onClick={() => handleBypassTap(actualRow, cIdx)}
                        className={`h-14 rounded-2xl border-2 transition-all ${
                          actualRow < bypassRow ? 'opacity-20 bg-green-900/10 border-transparent' :
                          isCurrent ? 'bg-gray-900 border-white/30 hover:border-white shadow-lg active:scale-95 scale-100' :
                          'bg-black/40 border-white/5 opacity-40 scale-95'
                        } flex items-center justify-center`}
                      >
                         {col.type === 'DANGER' && isCurrent && <AlertTriangle className="w-5 h-5 text-red-500/60" />}
                         {col.type === 'SAFE' && isCurrent && <Terminal className="w-5 h-5 text-green-500/60" />}
                      </button>
                    );
                  })}
                </div>
              ))}
           </div>
        </div>
      )}

      {/* WIN/LOSS SCREEN */}
      {(gameState === 'WON' || gameState === 'LOST') && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in slide-in-from-bottom-12 duration-500">
           <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center border-4 shadow-2xl ${
             gameState === 'WON' ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-red-600/20 border-red-500 text-red-500'
           }`}>
              {gameState === 'WON' ? <Trophy className="w-16 h-16" /> : <Skull className="w-16 h-16" />}
           </div>
           <div>
              <h2 className={`text-4xl font-black italic tracking-tighter uppercase ${gameState === 'WON' ? 'text-green-500' : 'text-red-500'}`}>
                {gameState === 'WON' ? 'System Optimized' : 'Neural Lockdown'}
              </h2>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] mt-3">
                {gameState === 'WON' ? `Credential Node Injected: +${STATS[difficulty].reward} PTS` : 'Critical Interference / Security Breach'}
              </p>
              {score > 0 && <p className="text-sm text-white font-black mt-2">Final Score: {score}</p>}
           </div>
           <button
             onClick={() => { setGameState('IDLE'); setMode('IDLE'); }}
             className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-2xl hover:bg-gray-100"
           >
             Return to Hub
           </button>
        </div>
      )}
    </div>
  );
};

const GameCard = ({ title, desc, hardFee, extremeFee, onHard, onExtreme, icon, color }: any) => (
  <div className="bg-[#0f0f12] p-5 rounded-[2rem] border border-white/5 space-y-4 group hover:border-white/20 transition-all shadow-xl">
    <div className="flex items-center gap-3">
       <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ${color} border border-white/5 group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <div className="flex-1">
          <h4 className="text-white font-black italic tracking-tighter uppercase text-sm">{title}</h4>
          <p className="text-[8px] text-gray-600 font-bold leading-tight uppercase tracking-widest">{desc}</p>
       </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
       <button
         onClick={onHard}
         className="flex flex-col items-center gap-1 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-indigo-500/40 transition-all active:scale-95"
       >
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-500">Standard</span>
          <span className="text-xs font-black italic text-white">-{hardFee}</span>
       </button>
       <button
         onClick={onExtreme}
         className="flex flex-col items-center gap-1 p-3 bg-red-950/20 border border-red-500/10 rounded-xl hover:bg-red-600 text-white transition-all active:scale-95 group/btn shadow-lg"
       >
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-red-500 group-hover/btn:text-white">Extreme</span>
          <span className="text-xs font-black italic text-red-500 group-hover/btn:text-white">-{extremeFee}</span>
       </button>
    </div>
  </div>
);

export default Arcade;
