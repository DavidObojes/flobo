import {Button, CircularProgress} from "@mui/material";
import {useState} from "react";



const CAT_URL = "https://cataas.com/cat?json=true"

export const CatGenerator = () => {


    type CatStats = {
      clawPower: number;
      zoomSpeed: number;
      furDensity: number;
      cuteness: number;
      chaosLuck: number;
    };

    type CatResponse = {
      url: string;
      name: string;
      stats: CatStats;
      status: number;
    };

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [catData, setCatData] = useState<CatResponse | null>(null);
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

    try{

    const image = await getRandomCatImage()
    console.log(image)

    const res = await fetch("/api/cat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: image
      })
    });

    if (!res.ok) {
        // z.B. 500 vom Backend
        const msg = await res.text();
        throw new Error(`Server returned ${res.status}: ${msg}`);
      }

    const dataStats: CatResponse = await res.json();
    setCatData(dataStats);
    setImageUrl(dataStats.url);

    //Set Image URL
    setImageUrl(dataStats.url);
    console.log("Generated name:", dataStats.name);

    } catch (e: any){
      console.error(e);
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false)
    }
  };

  return (<>

    {imageUrl &&
      <img
      src={imageUrl}
      alt="Your generated Cat"
      width="800"
      height="800"
      />
    }

    {catData && (
        <div style={{ marginTop: "20px" }}>
          <h1>{catData.name}</h1>
          <h3>Stats</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {Object.entries(catData.stats).map(([key, value]) => (
              <li key={key}>
                {key}: <strong>{value}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        <p style={{ color: "tomato", marginTop: 12 }}>
          Fehler: {error}
        </p>
    )}

  </>)
}