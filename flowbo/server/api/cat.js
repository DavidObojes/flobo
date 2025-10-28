// API - Cat
import express from 'express';

const router = express.Router();

const catData = [{
  id: '1',
  userId: 'a', //foreign key
  name: 'MaunziPaunz',
  url: 'https://cataas.com/cat/9e1xDB4LmMl0v6BO?position=center',
  stats: {
    clawPower: 7,   //Attack damage
    zoomSpeed: 9,   //Dodge / Crit chance
    furDensity: 6,  //Defense / Armor
    cuteness: 10,   //Debuff enemy / morale
    chaosLuck: 4    //randomly modifies another stat per round (the higher the better)
  },
  xp: '0',
  level: '1',
  wins: '3',
  losses: '5'
}]

//Sieg: +10 XP
//Niederlage: +2–3 XP (optional für Balance)
//Spezielle Aktionen: +1–5 XP

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

  const imageUrl = req.body.url
  console.log(req.body.url)

  //HIER WIRD DAS Katzenobjekt erstellt
  //cat = new Cat(<PARAMETERS>)

  //Die Katze wird dann zurück an das FE gesendet
  res.send({url: imageUrl,status: 201})

})

export default router;