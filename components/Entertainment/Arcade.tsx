
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Coins, TrendingUp, AlertTriangle, Play, Trophy, Skull, BrainCircuit, Terminal, Activity } from 'lucide-react';

interface ArcadeProps {
  points: number;
  onUpdatePoints: (newPoints: number) => void;
  addNotification: (msg: string) => void;
}

type GameMode = 'REFLEX' | 'SEQUENCE' | 'BYPASS' | 'IDLE';
type Difficulty = 'HARD' | 'EXTREME';

const Arcade: React.FC<ArcadeProps> = ({ points, onUpdatePoints, addNotification }) => {
  const [mode, setMode] = useState<GameMode>('IDLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('HARD');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  
  // Grid Bypass State
  const [bypassGrid, setBypassGrid] = useState<{ type: 'SAFE' | 'DANGER', active: boolean }[][]>([]);
  const [bypassRow, setBypassRow] = useState(0);

  const gameLoopRef = useRef<number | null>(null);

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

    if (gameMode === 'REFLEX') {
      startReflexGame(diff);
    } else if (gameMode === 'SEQUENCE') {
      startSequenceGame(diff);
    } else if (gameMode === 'BYPASS') {
      startBypassGame(diff);
    }
  };

  // --- NEURAL REFLEX ---
  const startReflexGame = (diff: Difficulty) => {
    const timeLimit = diff === 'HARD' ? 8 : 5;
    setTimer(timeLimit);
    spawnTarget();
  };

  const spawnTarget = () => {
    setTargetPos({
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70
    });
  };

  const handleTargetClick = () => {
    if (gameState !== 'PLAYING') return;
    const newScore = score + 1;
    setScore(newScore);
    const targetScore = difficulty === 'HARD' ? 20 : 35;
    if (newScore >= targetScore) endGame(true);
    else spawnTarget();
  };

  // --- QUANTUM SEQUENCE ---
  const startSequenceGame = (diff: Difficulty) => {
    const len = diff === 'HARD' ? 6 : 10;
    const newSeq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setUserSequence([]);
    playSequence(newSeq, diff);
  };

  const playSequence = async (seq: number[], diff: Difficulty) => {
    const speed = diff === 'HARD' ? 400 : 200;
    for (const pad of seq) {
      if (gameState !== 'PLAYING') break;
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
      if (newSeq.length === sequence.length) endGame(true);
    } else {
      endGame(false);
    }
  };

  // --- GRID BYPASS (HACKING) ---
  const startBypassGame = (diff: Difficulty) => {
    const rows = diff === 'HARD' ? 10 : 15;
    const cols = diff === 'HARD' ? 3 : 5;
    const grid = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => ({
        type: Math.random() > 0.7 ? 'DANGER' : 'SAFE' as any,
        active: false
      }))
    );
    setBypassGrid(grid);
    setBypassRow(0);
    setTimer(diff === 'HARD' ? 0.8 : 0.5); // Seconds per row
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

  useEffect(() => {
    let interval: number;
    if (gameState === 'PLAYING') {
      if (mode === 'REFLEX' && timer > 0) {
        interval = setInterval(() => {
          setTimer(t => (t <= 0.1 ? (endGame(false), 0) : t - 0.1));
        }, 100);
      } else if (mode === 'BYPASS') {
        // Auto-fail if too slow
        interval = setInterval(() => {
          endGame(false);
        }, (difficulty === 'HARD' ? 1.5 : 1.0) * 1000);
      }
    }
    return () => clearInterval(interval);
  }, [gameState, mode, bypassRow]);

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

          <div className="space-y-4">
            <GameCard 
              title="Grid Bypass" 
              desc="Identify safe ports in a collapsing firewall. Speed is mandatory." 
              hardFee={STATS.HARD.fee} 
              extremeFee={STATS.EXTREME.fee} 
              onHard={() => startGame('BYPASS', 'HARD')}
              onExtreme={() => startGame('BYPASS', 'EXTREME')}
              icon={<Terminal className="w-5 h-5" />}
              color="text-green-500"
            />
            <GameCard 
              title="Neural Reflex" 
              desc="Intercept data packets at high velocity. Accuracy test." 
              hardFee={STATS.HARD.fee} 
              extremeFee={STATS.EXTREME.fee} 
              onHard={() => startGame('REFLEX', 'HARD')}
              onExtreme={() => startGame('REFLEX', 'EXTREME')}
              icon={<Activity className="w-5 h-5" />}
              color="text-indigo-500"
            />
            <GameCard 
              title="Quantum Sequence" 
              desc="Reconstruct glitched neural patterns. Memory test." 
              hardFee={STATS.HARD.fee} 
              extremeFee={STATS.EXTREME.fee} 
              onHard={() => startGame('SEQUENCE', 'HARD')}
              onExtreme={() => startGame('SEQUENCE', 'EXTREME')}
              icon={<BrainCircuit className="w-5 h-5" />}
              color="text-purple-500"
            />
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && mode === 'BYPASS' && (
        <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase text-green-500 animate-pulse tracking-widest">Bypassing Firewall...</span>
              <span className="text-[10px] font-black text-white italic">{bypassRow} / {bypassGrid.length} Layers</span>
           </div>
           <div className="w-full space-y-2">
              {bypassGrid.slice(Math.max(0, bypassRow - 1), bypassRow + 4).map((row, rIdx) => (
                <div key={rIdx} className={`grid gap-2 w-full`} style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                  {row.map((col, cIdx) => {
                    const actualRow = Math.max(0, bypassRow - 1) + rIdx;
                    const isCurrent = actualRow === bypassRow;
                    return (
                      <button
                        key={cIdx}
                        onClick={() => handleBypassTap(actualRow, cIdx)}
                        className={`h-16 rounded-2xl border transition-all ${
                          actualRow < bypassRow ? 'opacity-20 bg-green-900/10 border-transparent' :
                          isCurrent ? 'bg-gray-900 border-white/20 hover:border-white shadow-lg active:scale-95' :
                          'bg-black/40 border-white/5 opacity-40'
                        } flex items-center justify-center`}
                      >
                         {col.type === 'DANGER' && isCurrent && <AlertTriangle className="w-4 h-4 text-red-500/40" />}
                         {col.type === 'SAFE' && isCurrent && <Terminal className="w-4 h-4 text-green-500/40" />}
                      </button>
                    );
                  })}
                </div>
              ))}
           </div>
        </div>
      )}

      {gameState === 'PLAYING' && mode === 'REFLEX' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-300">
          <div className="w-full flex justify-between px-2">
             <div className="text-white"><p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Hits</p><p className="text-xl font-black italic">{score}</p></div>
             <div className="text-right"><p className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500">Decay</p><p className="text-xl font-black italic text-red-500">{timer.toFixed(1)}s</p></div>
          </div>
          <div className="w-full aspect-square bg-[#0f0f12] rounded-[3rem] border border-white/10 relative shadow-2xl overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)]"></div>
             <button 
               onClick={handleTargetClick}
               className="absolute w-10 h-10 bg-indigo-600 rounded-full shadow-[0_0_25px_rgba(79,70,229,0.8)] border-2 border-white animate-pulse transition-all"
               style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, transform: 'translate(-50%, -50%)' }}
             />
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && mode === 'SEQUENCE' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in">
          <div className="text-center">
             <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic animate-pulse mb-2">Synchronizing Pattern...</p>
             <p className="text-sm font-black text-white italic uppercase tracking-tighter">{userSequence.length} / {sequence.length} Links Formed</p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full aspect-square p-4">
            {[0, 1, 2, 3].map(idx => (
              <button
                key={idx}
                onClick={() => handlePadClick(idx)}
                className={`rounded-[2.5rem] border-2 transition-all ${
                  activePad === idx 
                    ? 'bg-purple-600 border-white scale-95 shadow-[0_0_50px_rgba(168,85,247,1)]' 
                    : 'bg-[#1a1a1f] border-white/5 active:bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {(gameState === 'WON' || gameState === 'LOST') && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in slide-in-from-bottom-12 duration-500">
           <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center border-2 shadow-2xl ${
             gameState === 'WON' ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-red-600/20 border-red-500 text-red-500'
           }`}>
              {gameState === 'WON' ? <Trophy className="w-12 h-12" /> : <Skull className="w-12 h-12" />}
           </div>
           <div>
              <h2 className={`text-4xl font-black italic tracking-tighter uppercase ${gameState === 'WON' ? 'text-green-500' : 'text-red-500'}`}>
                {gameState === 'WON' ? 'System Optimized' : 'Neural Lockdown'}
              </h2>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] mt-3">
                {gameState === 'WON' ? `Credential Node Injected: +${STATS[difficulty].reward} PTS` : 'Critical Interference / Security Breach'}
              </p>
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
  <div className="bg-[#0f0f12] p-6 rounded-[2.5rem] border border-white/5 space-y-6 group hover:border-white/20 transition-all shadow-xl">
    <div className="flex items-center gap-5">
       <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${color} border border-white/5 group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <div className="flex-1">
          <h4 className="text-white font-black italic tracking-tighter uppercase text-lg">{title}</h4>
          <p className="text-[9px] text-gray-600 font-bold leading-tight uppercase tracking-widest">{desc}</p>
       </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
       <button 
         onClick={onHard}
         className="flex flex-col items-center gap-1.5 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-indigo-500/40 transition-all active:scale-95"
       >
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Standard Link</span>
          <span className="text-sm font-black italic text-white">-{hardFee} PTS</span>
       </button>
       <button 
         onClick={onExtreme}
         className="flex flex-col items-center gap-1.5 p-4 bg-red-950/20 border border-red-500/10 rounded-2xl hover:bg-red-600 text-white transition-all active:scale-95 group/btn shadow-lg"
       >
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500 group-hover/btn:text-white">Extreme Risk</span>
          <span className="text-sm font-black italic text-red-500 group-hover/btn:text-white">-{extremeFee} PTS</span>
       </button>
    </div>
  </div>
);

export default Arcade;
