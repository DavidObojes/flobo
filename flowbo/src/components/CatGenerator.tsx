import {Avatar, Button, CircularProgress} from "@mui/material";
import {useState} from "react";
import type {CatStats} from "../types/cat.ts";
import generateRandomStats from "../utils/generateRandomStats.ts";
import {generateRandomCatName} from "../utils/generateRandomCatName.ts";
import type { Cat } from "../types/cat";


const CAT_URL = "https://cataas.com/cat?json=true"

export const CatGenerator = ({ onGenerated }: { onGenerated?: (cat: Cat) => void }) => {

  const [loading, setLoading] = useState(false);
  const [catGenerated, setCatGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCat, setPendingCat] = useState<Cat | null>(null);

  const getRandomCatImage = async () => {
    try {
      const res = await fetch(CAT_URL)
      const data = await res.json()
      return data.url
    } catch (err) {
      console.error(err)
    }
  }

  const generateCat = async () => {
    setLoading(true)
    setError(null);

    try {

      const image = await getRandomCatImage()
      const newCat: Cat = {
        name: generateRandomCatName(),
        imageUrl: image,
        stats: generateRandomStats(),
        xp: 0,
        level: 1,
        wins: 0,
        losses: 0,
      };

        setPendingCat(newCat);
        onGenerated?.(newCat);
        return newCat;
    } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Unknown error");
    } finally {
        setLoading(false)
        setCatGenerated(true)
    }
  };


  const addToPack = async (cat: Cat) => {

    const token = localStorage.getItem("access_token");

    const res = await fetch("/api/cat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 👈 Token mitschicken
      },
      body: JSON.stringify(cat)
    });


    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Server returned ${res.status}: ${msg}`);
    }

    const saved = await res.json();
    onGenerated?.(saved);
    console.log("Added Cat to DB")
  }

    return (
    <>
      <Avatar
        alt="Generated Cat"
        src={loading ? "" : pendingCat?.imageUrl || ""}
        sx={{
          width: "300px",
          height: "300px",
          objectFit: "cover",
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        {loading && <CircularProgress size={80} />}
      </Avatar>

      {/* Show Generated Cat */}
      {catGenerated && pendingCat && (
        <div style={{ marginTop: "20px" }}>
          <h1>{pendingCat.name}</h1>

          <h3>Stats</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {(Object.keys(pendingCat.stats) as (keyof CatStats)[]).map((key) => (
              <li key={key}>
                {key}: <strong>{pendingCat.stats[key]}</strong>
              </li>
            ))}
          </ul>

          <Button
            //onClick={addToPack}
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            disabled={loading || !pendingCat}
            startIcon={loading ? <CircularProgress size={18} /> : null}
            sx={{ mt: 2 }}
          >
            Zum Rudel hinzufügen
          </Button>
        </div>
      )}

      {/* Generate a new Cat */}
      <Button
        onClick={async () => {
          const cat = await generateCat();
          if (cat) await addToPack(cat);
        }}
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} /> : null}
        sx={{ mt: 2 }}
      >
        {loading ? "Generiert…" : "Katze generieren"}
      </Button>

      {error && (
        <p style={{ color: "tomato", marginTop: 12 }}>
          Fehler: {error}
        </p>
      )}
    </>
  );
}