import {Button, CircularProgress} from "@mui/material";
import {useState} from "react";


const CAT_URL = "https://cataas.com/cat?json=true"

export const CatGenerator = () => {

  const [loading, setLoading] = useState(false);

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

    const data = await res.json();
    console.log(data);

    setLoading(false)
  }

  return (<>

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

  </>)
}