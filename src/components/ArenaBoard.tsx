import {useEffect, useState} from "react";
import {EnemyCatList} from "./EnemyCatList";
import { simulateBattle, type BattleLogEntry } from "../utils/combatEngine";

import {
  Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack,
  LinearProgress, Chip, Divider
} from "@mui/material";

import type {Cat} from "../types/cat";
import {CatDetail} from "./CatDetail.tsx";
import {apiRequest} from "../utils/apiClient.ts";
import {MyCatList} from "./MyCatList.tsx";
import type {User} from "../types/user.ts";


const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));


export default function ArenaBoard() {

  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [myCat, setMyCat] = useState<Cat | null>(null);
  const [fightOpen, setFightOpen] = useState(false);
  const [opponent, setOpponent] = useState<Cat | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [enemyCats, setEnemyCats] = useState<Cat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAnimatingFight, setIsAnimatingFight] = useState(false);
  const [showFightStats, setShowFightStats] = useState(false);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [hpView, setHpView] = useState<Record<string, { hp: number; maxHp: number }> | null>(null);

  const [pendingLevelUpCat, setPendingLevelUpCat] = useState<Cat | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await apiRequest("/api/user");
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);


  useEffect(() => {
    const getCatData = async () => {
      try {

        const response = await apiRequest("/api/cat");

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const catsData = await response.json();
        setCats(catsData);
        if (catsData.length > 0) {
          setSelectedCat(catsData[0]);
          setMyCat(catsData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch cats:", err);
      }
    };

    const getEnemyCats = async () => {
      try {
        const response = await apiRequest("/api/cat/enemies");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setEnemyCats(data);
      } catch (err) {
        console.error("Failed to fetch enemy cats:", err);
      }
    };

    getCatData();
    getEnemyCats();
  }, []);


  function calcXpGain(winnerLevel: number, enemyLevel: number) {
    const base = 30;
    const diff = enemyLevel - winnerLevel; 
    const mult = Math.max(0.5, Math.min(2.0, 1 + diff * 0.15));
    return Math.round(base * mult);
  }

  function applyXpAndLevel(cat: { xp: number; level: number; unspentPoints: number }, gain: number) {
    let xp = cat.xp + gain;
    let level = cat.level;
    let points = cat.unspentPoints;

    while (xp >= 100) {
      xp -= 100;
      level += 1;
      points += 1;
    }
    return { xp, level, unspentPoints: points };
  }


  const replaceCatInState = (updated: Cat) => {

    setCats(prev => prev.map(c => c._id === updated._id ? updated : c));


    setEnemyCats(prev => prev.map(c => c._id === updated._id ? updated : c));

    if (selectedCat?._id === updated._id) setSelectedCat(updated);
    if (myCat?._id === updated._id) setMyCat(updated);
    if (opponent?._id === updated._id) setOpponent(updated);

  };
  const playBattleWithDelay = async (
    fullLog: BattleLogEntry[],
    finalHp: Record<string, { hp: number; maxHp: number }>,
    delayMs = 1200
  ) => {
    setBattleLog([]);
    setResult(null);

    const currentHp: Record<string, { hp: number; maxHp: number }> = Object.fromEntries(
      Object.entries(finalHp).map(([id, v]) => [id, { hp: v.maxHp, maxHp: v.maxHp }])
    );

    setHpView({ ...currentHp });

    const parseDamage = (text: string): number | null => {
      const m = text.match(/-(\d+(?:\.\d+)?)\s*HP/i);
      if (!m) return null;
      const n = Number(m[1]);
      return Number.isFinite(n) ? n : null;
    };

    for (let i = 0; i < fullLog.length; i++) {
      const entry = fullLog[i];
      setBattleLog(prev => [...prev, entry]);

      const dmg = parseDamage(entry.text);

      if (dmg != null) {

        if (entry.text.toLowerCase().includes("verletzt sich selbst")) {
          const a = currentHp[entry.attackerId];
          if (a) a.hp = Math.max(0, a.hp - dmg);
        }

        else if (entry.text.toLowerCase().includes("trifft")) {
          const d = currentHp[entry.defenderId];
          if (d) d.hp = Math.max(0, d.hp - dmg);
        }


        setHpView({ ...currentHp });
      }

      const next = fullLog[i + 1];
      if (!next || next.round !== entry.round) {
        await sleep(delayMs);
      }
    }

    setHpView(finalHp);
  };



  const startFight = async () => {
    if (!myCat || !opponent) return;
    setIsAnimatingFight(true);


    const res = simulateBattle(myCat, opponent);
    await playBattleWithDelay(res.log, res.final);

    setIsAnimatingFight(false);

    const winner = res.winnerId === myCat._id ? myCat : opponent;
    const loser  = res.loserId  === myCat._id ? myCat : opponent;

    const winnerLevel = winner.level ?? 1;
    const loserLevel  = loser.level ?? 1;
    const xpGain = calcXpGain(winnerLevel, loserLevel);

    const winnerProgressed = {
      ...winner,
      ...applyXpAndLevel(
        {
          xp: winner.xp ?? 0,
          level: winner.level ?? 1,
          unspentPoints: winner.unspentPoints ?? 0,
        },
        xpGain
      ),
    };

    try {

      const [updatedWinner, updatedLoser] = await Promise.all([
        apiRequest(`/api/cat/${winner._id}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incWin: true,
            incLoss: false,
            set: {
              xp: winnerProgressed.xp,
              level: winnerProgressed.level,
              unspentPoints: winnerProgressed.unspentPoints,
            },
          }),
        }).then(r => r.json()),

        apiRequest(`/api/cat/${loser._id}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incWin: false,
            incLoss: true,
          }),
        }).then(r => r.json()),
      ]);

      replaceCatInState(updatedWinner);
      replaceCatInState(updatedLoser);

      setResult(`${updatedWinner.name} wins! (+${xpGain} XP)`);


      const iWon = myCat?._id && updatedWinner._id === myCat._id;

      if (iWon) {
        if ((updatedWinner.unspentPoints ?? 0) > 0) {
          setPendingLevelUpCat(updatedWinner);
        }
      } else {

        if ((updatedWinner.unspentPoints ?? 0) > 0) {
          await autoAllocateForEnemy(updatedWinner);
        }
      }
    } catch (e) {
      console.error(e);
      setResult("Fight simulated, but server sync failed.");
    }
  };


  const spendPoint = async (statKey: keyof Cat["stats"]) => {
    if (!pendingLevelUpCat) return;
    if ((pendingLevelUpCat.unspentPoints ?? 0) <= 0) return;

    const updatedLocal: Cat = {
      ...pendingLevelUpCat,
      unspentPoints: (pendingLevelUpCat.unspentPoints ?? 0) - 1,
      stats: {
        ...pendingLevelUpCat.stats,
        [statKey]: pendingLevelUpCat.stats[statKey] + 1,
      },
    };

    setPendingLevelUpCat(updatedLocal);


    const res = await apiRequest(`/api/cat/${pendingLevelUpCat._id}/allocate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statKey, delta: 1 }),
    });

    const saved = await res.json();
    replaceCatInState(saved);

    if ((saved.unspentPoints ?? 0) <= 0) setPendingLevelUpCat(null);
  };

  const statLabel: Record<keyof Cat["stats"], string> = {
    clawPower: "Claw Power",
    zoomSpeed: "Zoom Speed",
    furDensity: "Fur Density",
    cuteness: "Cuteness",
    chaosLuck: "Chaos Luck",
  };
  const orderedStats = ["clawPower", "zoomSpeed", "furDensity", "cuteness", "chaosLuck"] as const;
  const statKeys = ["clawPower", "zoomSpeed", "furDensity", "cuteness", "chaosLuck"] as const;

  const randomStatKey = (): keyof Cat["stats"] => {
    return statKeys[Math.floor(Math.random() * statKeys.length)];
  };

  const autoAllocateForEnemy = async (enemy: Cat) => {
    const enemyId = enemy._id;
    if (!enemyId) return;

    let points = enemy.unspentPoints ?? 0;
    let latest = enemy;

    while (points > 0) {
      const statKey = randomStatKey();

      const r = await apiRequest(`/api/cat/${enemyId}/allocate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statKey, delta: 1 }),
      });

      if (!r.ok) {
        console.error("Enemy auto-allocate failed:", await r.text());
        break;
      }

      latest = await r.json();
      replaceCatInState(latest);

      points = latest.unspentPoints ?? 0;
    }
  };


  const getHp = (cat: Cat | null) => {
    if (!cat || !hpView || !cat._id) return null;
    return hpView[cat._id];
  };

  const getXp = (cat: Cat | null) => cat?.xp ?? 0;
  const getLevel = (cat: Cat | null) => cat?.level ?? 1;



  const closeFight = () => {
    setFightOpen(false);
    setOpponent(null);
    setResult(null);
    setBattleLog([]);
    setHpView(null);
    setShowFightStats(false);
};

  /*  const fight = (opponent: Cat) => {
    console.log("Fight against another Cat...");
    setOpponent(opponent);
    setFightOpen(true);
  };*/


    return (
    <div className="min-h-screen p-4 md:p-10 text-white">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* 1. SPALTE: SQUAD LISTE */}
        <aside className="lg:col-span-4 flex flex-col gap-4 h-full">
          <div className="bg-[#1e1e1e] rounded-3xl border-2 border-yellow-400 overflow-hidden shadow-lg">
            <div className="bg-yellow-400 p-4 text-black">
              <h2 className="text-lg font-black uppercase italic leading-none">Mein Rudel</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase">Wähle Kämpfer</p>
            </div>
            <div className="p-4">
              <MyCatList
                cats={cats}
                onSelect={(cat) => {
                  setSelectedCat(cat);
                  setMyCat(cat);
                }}
              />
            </div>
          </div>
        </aside>

        {/* 2. SPALTE: KÄMPFER-DETAILS */}
        <main className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#1e1e1e] rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl relative">
            <div className="bg-gray-800 p-4 text-white border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black uppercase italic leading-none text-yellow-400">Gewählte Einheit</h2>
              </div>
              {myCat && (
                <div className="animate-pulse bg-red-600 px-2 py-1 rounded text-[10px] font-black italic">
                  ACTIVE
                </div>
              )}
            </div>

            <div className="p-6">
              <CatDetail cat={selectedCat} />
            </div>
          </div>
        </main>

        {/* 3. SPALTE: GEGNER-ARENA */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#1e1e1e] rounded-3xl border-2 border-red-500/50 overflow-hidden shadow-lg">
            <div className="bg-red-600 p-4 text-white">
              <h2 className="text-lg font-black uppercase italic leading-none">Gegner-Arena</h2>
              <p className="text-[10px] font-bold opacity-70 uppercase">Wähle Ziel</p>
            </div>
            <div className="p-4">
              <EnemyCatList
                cats={enemyCats}
                users={users}
                onSelect={(cat) => setOpponent(cat)}
                onFight={(cat) => {
                  setOpponent(cat);
                  setFightOpen(true);
                }}
              />
            </div>
          </div>
        </aside>

      </div>

      {/* --- KAMPF DIALOG --- */}
      <Dialog
        open={fightOpen}
        onClose={closeFight}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: "#1e1e1e",
            color: "white",
            borderRadius: 4,
            border: "2px solid #facc15",
            backgroundImage: "none",
            width: "min(1100px, 98vw)", // <- breiter als vorher
            maxWidth: "none",           // <- wichtig, sonst überschreibt MUI maxWidth
          },
        }}
      >
        <DialogTitle className="text-center bg-yellow-400 text-black font-black uppercase italic">
          Arena Battle
        </DialogTitle>

        <DialogContent>
          {/* Top: Portraits */}
          <div className="flex justify-between items-center my-6 gap-4">
            <div className="text-center group flex-1">
              {myCat && (
                <div className="relative">
                  <img
                    src={myCat.imageUrl}
                    alt={myCat.name}
                    className="w-28 h-28 md:w-40 md:h-40 object-cover rounded-full border-4 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] mx-auto"
                  />
                  <Typography variant="h6" mt={2} mb={1}>{myCat.name}</Typography>
                  <div className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded max-w-[70px] mx-auto">
                    YOU
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-black italic animate-pulse">
              VS
            </div>

            <div className="text-center flex-1">
              {opponent && (
                <div className="relative">
                  <img
                    src={opponent.imageUrl}
                    alt={opponent.name}
                    className="w-28 h-28 md:w-40 md:h-40 object-cover rounded-full border-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] mx-auto"
                  />
                  <Typography variant="h6" mt={2} mb={1}>{opponent.name}</Typography>
                  <div className="bg-red-500 text-black text-xs font-bold px-3 py-1 rounded max-w-[70px] mx-auto">
                    FOE
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-white/10 p-4 rounded-xl text-center border-l-4 border-yellow-400">
              <Typography variant="h5" className="font-black text-yellow-400 underline italic">
                {result}
              </Typography>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: HP / XP */}
            <div className="lg:col-span-5">
              <Stack spacing={2} className="bg-black/30 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase font-bold tracking-widest text-gray-400">
                    Combat Status
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-[11px] text-gray-500 font-bold">
                      {battleLog.length} actions
                    </div>

                    <Button
                      size="small"
                      onClick={() => setShowFightStats(v => !v)}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: "rgba(255,255,255,0.06)",
                        color: "#facc15",
                        fontWeight: 900,
                        textTransform: "none",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.10)" },
                      }}
                    >
                      {showFightStats ? "Hide stats" : "Show stats"}
                    </Button>
                  </div>
                </div>


                {/* YOU Panel */}
                <div className="rounded-xl border border-yellow-400/40 bg-black/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Chip size="small" label="YOU" sx={{ bgcolor: "#facc15", color: "black", fontWeight: 900 }} />
                    <div className="text-xs text-gray-300 font-bold uppercase tracking-widest">
                      Lv {getLevel(myCat)} · {getXp(myCat)}/100 XP
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 font-bold mb-1">HP</div>
                  <LinearProgress
                    variant="determinate"
                    value={(() => {
                      const h = getHp(myCat);
                      if (!h) return 100;
                      return (h.hp / h.maxHp) * 100;
                    })()}
                    sx={{
                      height: 10,
                      borderRadius: 99,
                      bgcolor: "rgba(255,255,255,0.06)",
                      "& .MuiLinearProgress-bar": { bgcolor: "#facc15" },
                    }}
                  />
                  <div className="mt-1 text-[11px] text-gray-300 font-bold">
                    {(() => {
                      const h = getHp(myCat);
                      if (!h) return "—";
                      return `${Math.max(0, Math.round(h.hp))} / ${Math.round(h.maxHp)} HP`;
                    })()}
                  </div>
                </div>

                {/* FOE Panel */}
                <div className="rounded-xl border border-red-500/40 bg-black/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Chip size="small" label="FOE" sx={{ bgcolor: "#ef4444", color: "black", fontWeight: 900 }} />
                    <div className="text-xs text-gray-300 font-bold uppercase tracking-widest">
                      Lv {getLevel(opponent)} · {getXp(opponent)}/100 XP
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 font-bold mb-1">HP</div>
                  <LinearProgress
                    variant="determinate"
                    value={(() => {
                      const h = getHp(opponent);
                      if (!h) return 100;
                      return (h.hp / h.maxHp) * 100;
                    })()}
                    sx={{
                      height: 10,
                      borderRadius: 99,
                      bgcolor: "rgba(255,255,255,0.06)",
                      "& .MuiLinearProgress-bar": { bgcolor: "#ef4444" },
                    }}
                  />
                  <div className="mt-1 text-[11px] text-gray-300 font-bold">
                    {(() => {
                      const h = getHp(opponent);
                      if (!h) return "—";
                      return `${Math.max(0, Math.round(h.hp))} / ${Math.round(h.maxHp)} HP`;
                    })()}
                  </div>
                </div>
                {showFightStats && (
                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <div className="text-[11px] uppercase font-black tracking-widest text-gray-400 mb-2">
                    Stats
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* YOU stats */}
                    <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black px-2 py-[2px] rounded bg-yellow-400 text-black">
                          YOU
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Lv {getLevel(myCat)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        {myCat && orderedStats.map((k) => (
                          <div key={k} className="flex justify-between text-sm">
                            <span className="text-gray-300 font-bold">{statLabel[k]}</span>
                            <span className="text-yellow-200 font-black">{myCat.stats[k]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOE stats */}
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black px-2 py-[2px] rounded bg-red-500 text-black">
                          FOE
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Lv {getLevel(opponent)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        {opponent && orderedStats.map((k) => (
                          <div key={k} className="flex justify-between text-sm">
                            <span className="text-gray-300 font-bold">{statLabel[k]}</span>
                            <span className="text-red-200 font-black">{opponent.stats[k]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}


                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

                <div className="text-[11px] text-gray-400 font-bold">
                  Tipp: Wenn du den Kampf langsam sehen willst: Delay ist pro Runde aktiv (UI-Replay).
                </div>
              </Stack>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-black/30 p-3 rounded-xl border border-white/10">
                <div className="text-[11px] uppercase font-bold tracking-widest text-gray-400 flex justify-between">
                  <span>Rounds</span>
                  <span className="text-gray-500">Turn-based replay</span>
                </div>

                <div className="mt-2 max-h-[520px] overflow-auto rounded-lg border border-white/10 bg-black/30 p-2">
                  {battleLog.length === 0 ? (
                    <div className="text-sm text-gray-400 font-bold px-1 py-2">Noch kein Kampf gestartet.</div>
                  ) : (
                    (() => {
                      const grouped = battleLog.reduce<Record<number, BattleLogEntry[]>>((acc, e) => {
                        (acc[e.round] ??= []).push(e);
                        return acc;
                      }, {});

                      const rounds = Object.keys(grouped)
                        .map(Number)
                        .sort((a, b) => a - b);

                      return (
                        <div className="flex flex-col gap-2">
                          {rounds.map((r) => (
                            <div key={r} className="rounded-lg border border-white/10 bg-[#141414] overflow-hidden">
                              {/* Round header */}
                              <div className="flex items-center justify-between px-2 py-1 bg-white/5 border-b border-white/10">
                                <div className="text-[11px] font-black uppercase tracking-widest text-gray-300">
                                  R{r}
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  {grouped[r].length}
                                </div>
                              </div>

                              {/* Round entries */}
                              <div className="p-2 flex flex-col gap-1">
                                {grouped[r].map((e, idx) => {
                                  const isYou = myCat?._id && e.attackerId === myCat._id;

                                  return (
                                    <div
                                      key={idx}
                                      className={`flex items-start gap-2 rounded-md border px-2 py-1 text-[13px] leading-snug ${
                                        isYou
                                          ? "border-yellow-400/15 bg-yellow-400/5"
                                          : "border-red-500/15 bg-red-500/5"
                                      }`}
                                    >
                                      <span
                                        className={`shrink-0 text-[10px] font-black px-2 py-[2px] rounded ${
                                          isYou ? "bg-yellow-400 text-black" : "bg-red-500 text-black"
                                        }`}
                                      >
                                        {isYou ? "YOU" : "FOE"}
                                      </span>

                                      <span className={isYou ? "text-yellow-100 font-bold" : "text-red-100 font-bold"}>
                                        {e.text}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>

          </div>
        </DialogContent>

        <DialogActions className="p-4 bg-gray-900/50">
          {!result ? (
            <Button
              onClick={startFight}
              disabled={!myCat || !opponent || isAnimatingFight}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#facc15",
                color: "black",
                fontWeight: 900,
                paddingY: 1.5,
                opacity: (!myCat || !opponent) ? 0.5 : 1,
                "&:hover": { bgcolor: "#eab308" },
              }}
            >
              {isAnimatingFight ? "Fighting..." : "Start Combat!"}
            </Button>
          ) : (
            <Button onClick={closeFight} sx={{ color: "#facc15", fontWeight: 900 }}>
              Schließen
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!pendingLevelUpCat}
        onClose={() => {  }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: "#121212",
            color: "white",
            borderRadius: 4,
            border: "2px solid #22c55e",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle className="text-center bg-green-500 text-black font-black uppercase italic">
          Level Up!
        </DialogTitle>

        <DialogContent>
          {pendingLevelUpCat && (
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <img
                  src={pendingLevelUpCat.imageUrl}
                  alt={pendingLevelUpCat.name}
                  className="w-20 h-20 object-cover rounded-full border-4 border-green-400"
                />
                <div className="flex-1">
                  <Typography variant="h6" className="font-black">
                    {pendingLevelUpCat.name}
                  </Typography>
                  <div className="text-sm text-gray-300 font-bold">
                    Level: {pendingLevelUpCat.level ?? 1} · XP: {pendingLevelUpCat.xp ?? 0}/100
                  </div>
                  <div className="mt-2 text-sm font-black text-green-300">
                    Ungenutzte Punkte: {pendingLevelUpCat.unspentPoints ?? 0}
                  </div>
                </div>
              </div>

              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />

              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(statLabel) as (keyof Cat["stats"])[]).map((k) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3"
                  >
                    <div>
                      <div className="text-sm font-black text-white">{statLabel[k]}</div>
                      <div className="text-xs text-gray-400 font-bold">
                        Current: {pendingLevelUpCat.stats[k]}
                      </div>
                    </div>

                    <Button
                      onClick={() => spendPoint(k)}
                      disabled={(pendingLevelUpCat.unspentPoints ?? 0) <= 0}
                      variant="contained"
                      sx={{
                        bgcolor: "#22c55e",
                        color: "black",
                        fontWeight: 900,
                        "&:hover": { bgcolor: "#16a34a" },
                      }}
                    >
                      +1
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-400 font-bold">
                Tipp: Verteidigung = Fur Density, Dodge = Zoom Speed, Crit/Chaos = Chaos Luck.
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions className="p-4 bg-gray-900/50">
          <Button
            disabled={(pendingLevelUpCat?.unspentPoints ?? 0) > 0}
            onClick={() => setPendingLevelUpCat(null)}
            sx={{
              color: "#22c55e",
              fontWeight: 900,
              opacity: (pendingLevelUpCat?.unspentPoints ?? 0) > 0 ? 0.4 : 1,
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


