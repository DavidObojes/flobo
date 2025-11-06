// API - Cat
import express from 'express';
import Cat from "../classes/Cat.js";

const router = express.Router();

//Get all Cats
router.get('/', (req, res, next) => {
  res.json(catData).status(200).send()
})

//Get Single Cat
router.get('/:id', (req, res, next) => {
  const cat = catData.find(c => c.id === req.params.id)
  if(cat) {
    res.json(cat).status(200).send()
  }
  else {
    res.status(403).send()
  }
})

//Create Single Cat
router.post('/', (req, res, next) => {

  try {

      const imageUrl = req.body.url
      //const userId = req.body.userId
      //const name = req.body.name
      //const stats = req.body.stats

      //HIER WIRD DAS Katzenobjekt erstellt
      //const cat = new Cat(userId, name, imageUrl,stats)

      //console.log("Instance of Cat:",cat)

      //Erfolgreich in der DB angelegt
      res.send({msg:"Erfolgreich erstellt:" + {imageUrl}, status: 201})
  }catch (err){
      console.error(err);
      return res.status(500).json({ error: "Cat generation failed" });
  }

});

export default router;