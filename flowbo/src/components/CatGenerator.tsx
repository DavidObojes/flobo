import {Avatar, Button, CircularProgress} from "@mui/material";
import {useState} from "react";
import type {CatStats} from "../types/cat.ts";
import generateRandomStats from "../utils/generateRandomStats.ts";
import {generateRandomCatName} from "../utils/generateRandomCatName.ts";
import {generateRandomUserId} from "../utils/generateRandomUserId.ts";


const CAT_URL = "https://cataas.com/cat?json=true"

export const CatGenerator = () => {

  const [loading, setLoading] = useState(false);
  const [catGenerated, setCatGenerated] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [stats, setStats] = useState<CatStats>()
  const [error, setError] = useState<string | null>(null);

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

      //Set States
      setImageUrl(image);
      setName(generateRandomCatName())
      setStats(generateRandomStats())

    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false)
      setCatGenerated(true)
    }
  };


  const addToPack = async () => {

    const res = await fetch("/api/cat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: generateRandomUserId(),
        name: name,
        url: imageUrl,
        stats: stats,
        xp: 0,
        level: 1,
        wins: 0,
        losses: 0
      })
    });


    if (!res.ok) {
      // z.B. 500 vom Backend
      const msg = await res.text();
      throw new Error(`Server returned ${res.status}: ${msg}`);
    }

    console.log("Added Cat to DB")
  }

  return (<>

    <Avatar
        alt="Generated Cat"
        src={loading ? "" : imageUrl || ""}
        sx={{
          width: "300px",
          height: "300px",
          objectFit: "cover", // scale image to fill
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.3s ease",
        }}
    >
      {loading && <CircularProgress size={80}/>}
    </Avatar>

    {/* Show Generated Cat */}
    {catGenerated && (
        <div style={{marginTop: "20px"}}>
          <h1>{name}</h1>
          {stats && (
              <>
                <h3>Stats</h3>
                <ul style={{listStyle: "none", padding: 0}}>
                  {(Object.keys(stats) as (keyof CatStats)[]).map((key) => (
                      <li key={key}>
                        {key}: <strong>{stats[key]}</strong>
                      </li>
                  ))}
                </ul>
              </>
          )}

          <Button
              onClick={addToPack}
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18}/> : null}
              sx={{mt: 2}}
          >
            Zum Rudel hinzufügen
          </Button>
        </div>
    )}

     {/* Generate a new Cat */}
    <Button
        onClick={generateCat}
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18}/> : null}
        sx={{mt: 2}}
    >
      {loading ? "Generiert…" : "Katze generieren"}
    </Button>

    {error && (
        <p style={{color: "tomato", marginTop: 12}}>
          Fehler: {error}
        </p>
    )}

  </>)
}