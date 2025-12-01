// API - Cat
import express from 'express';

const router = express.Router();

//Get all Cats
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db'); // get reference to the db from app config
    const cats = await db.collection('cat').find({}).toArray();

    res.json(cats);
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
    const insertion = await db.collection('cat').insertOne(req.body);
    if (insertion.acknowledged) {
      const cat = await db.collection('cat')
        .findOne({ _id: insertion.insertedId });
      if (cat) {
        res.status(201).json(cat);
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

// PATCH /api/cat/:userId/level
router.patch('/:userId/level', async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = String(req.params.userId || '').trim();
    const { delta = 1, incWin = true } = req.body || {};

    const update = { $inc: { level: delta } };
    if (incWin) update.$inc.wins = 1;

    // 1) Updaten (ohne Rückgabe-Dokument)
    console.log('LevelUp filter:', { userId });
    const r = await db.collection('cats').updateOne({ userId }, update);

    // 2) Nichts gematcht? -> 404, keine Exception
    if (r.matchedCount === 0) {
      return res.status(404).json({ message: `Cat not found for userId ${userId}` });
    }

    // 3) Aktualisiertes Dokument holen und zurückgeben
    const doc = await db.collection('cats').findOne({ userId });
    return res.json(doc);
  } catch (err) {
    console.error('LevelUp error:', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

export default router;