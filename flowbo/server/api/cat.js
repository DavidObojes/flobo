// API - Cat
import express from 'express';

const router = express.Router();

//Get all Cats
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db'); // get reference to the db from app config
    const users = await db.collection('cats').find({}).toArray();

    res.json(users);
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

//Get Single Cat (not implemented)
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
router.post('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const insertion = await db.collection('cats').insertOne(req.body);
    if (insertion.acknowledged) {
      const user = await db.collection('cats')
        .findOne({ _id: insertion.insertedId });

      if (user) {
        res.status(201).json(user);
      } else {
        res.status(404).send();
      }
    } else {
      res.status(500).send();
    }
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

export default router;