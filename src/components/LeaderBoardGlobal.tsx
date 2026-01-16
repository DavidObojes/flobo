import {useEffect, useState} from "react";
import type {Cat} from "../types/cat";
import {apiRequest} from "../utils/apiClient.ts";
import type {User} from "../types/user.ts";

// === Super Crazy LeaderBoard ===
export default function LeaderBoardGlobal() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [users, setUsers] = useState<User[]>([]); // To store user list

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cats and users in parallel
        const [catRes, userRes] = await Promise.all([
          apiRequest("/api/cat/all"),
          apiRequest("/api/user"), // Assuming you have this endpoint
        ]);

        const catsData = await catRes.json();
        const usersData = await userRes.json();
        console.log("usersData:", usersData);

        setCats(catsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // Helper to find the username
  const getOwnerName = (userId: string | undefined) => {
    const user = users.find((u) => String(u._id) === String(userId));
    return user ? user.firstName + " " + user.lastName : "Unknown Trainer";
  };

  // --- Derived Leaderboard Lists ---
  // Hall of Fame: Sorted by Wins (Descending)
  const topWinners = [...cats]
    .sort((a, b) => (b.wins || 0) - (a.wins || 0))
    .slice(0, 10);

  // Scrappy Fighters: Sorted by Losses (Descending)
  const topLosers = [...cats]
    .sort((a, b) => (b.losses || 0) - (a.losses || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen p-4 md:p-10 text-white space-y-10">

      {/* SECTION 2: GLOBAL LEADERBOARDS */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* COLUMN: MOST WINS */}
        <div className="bg-[#1e1e1e] rounded-3xl border-2 border-yellow-400 overflow-hidden shadow-lg">
          <div className="bg-yellow-400 p-4 text-black flex justify-between items-center">
            <h2 className="text-xl font-black uppercase italic">Hall of Fame</h2>
            <span className="text-xs font-bold uppercase tracking-tighter">Most Victories</span>
          </div>
          <div className="p-4 space-y-2">
            {topWinners.map((cat, index) => (
              <div
                key={cat._id}
                className={`flex items-center justify-between p-3 rounded-xl border bg-white/5 border-white/10`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-yellow-400 font-black italic w-5 text-lg">#{index + 1}</span>
                  <img src={cat.imageUrl} alt=""
                    className="w-10 h-10 rounded-full border border-yellow-400/30 object-cover"/>
                  <span className="font-bold text-left">
                    {cat.name}
                    <span className="text-[10px] text-yellow-500/70 uppercase font-black italic block">
                      {getOwnerName(cat.userId)}
                    </span>
                  </span>

                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-black text-lg">{cat.wins || 0}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Wins</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN: MOST LOSSES */}
        <div className="bg-[#1e1e1e] rounded-3xl border-2 border-red-500/50 overflow-hidden shadow-lg">
          <div className="bg-red-600 p-4 text-white flex justify-between items-center">
            <h2 className="text-xl font-black uppercase italic">Scrappy Fighters</h2>
            <span className="text-xs font-bold uppercase tracking-tighter">Most Beaten Up</span>
          </div>
          <div className="p-4 space-y-2">
            {topLosers.map((cat, index) => (
              <div
                key={cat._id}
                className={`flex items-center justify-between p-3 rounded-xl border bg-white/5 border-white/10`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-red-500 font-black italic w-5 text-lg">#{index + 1}</span>
                  <img src={cat.imageUrl} alt=""
                    className="w-10 h-10 rounded-full border border-red-500/30 object-cover"/>
                  <span className="font-bold text-left">{cat.name}
                    <span className="text-[10px] text-red-500 uppercase font-black italic block">
                      {getOwnerName(cat.userId)}
                    </span></span>
                </div>
                <div className="text-right">
                  <div className="text-red-500 font-black text-lg">{cat.losses || 0}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Defeats</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}