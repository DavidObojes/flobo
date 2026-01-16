// API - Cat
import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');

    // get userId from OAuth token
    const userId = String(res.locals.oauth?.token?.user?.user_id || '').trim();
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // only cats that belong to this user
    const cats = await db.collection('cat').find({ userId }).toArray();

    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.get('/all', async (req, res) => {
  try {
    const db = req.app.get('db');

    // all cats
    const cats = await db.collection('cat').find({}).toArray();
    res.json(cats);

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// GET /api/cat/enemies  -> all cats from *other* users
router.get('/enemies', async (req, res) => {
  try {
    const db = req.app.get('db');

    const oauthUserId = res.locals.oauth?.token?.user?.user_id;
    if (!oauthUserId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const myId = String(oauthUserId).trim();

    // all cats where userId != myId
    const cats = await db
      .collection('cat')
      .find({ userId: { $ne: myId } })
      .toArray();

    return res.json(cats);
  } catch (err) {
    console.error('GET /api/cat/enemies error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


//Create Single Cat
router.post('/', async (req, res) => {
  try {
    const db = req.app.get('db');

    const userId = String(res.locals.oauth?.token?.user?.user_id || '').trim();
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Take everything from the body *except* userId and override it
    const catData = {
      ...req.body,
      userId,          // 👈 always the logged-in user
      wins: req.body.wins ?? 0,
      losses: req.body.losses ?? 0,
      xp: req.body.xp ?? 0,
      level: req.body.level ?? 1,
    };

    const insertion = await db.collection('cat').insertOne(catData);

    if (insertion.acknowledged) {
      const cat = await db
        .collection('cat')
        .findOne({ _id: insertion.insertedId });

      if (cat) {
        return res.status(201).json(cat);
      } else {
        return res.status(404).send();
      }
    } else {
      return res.status(500).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// PATCH /api/cat/:id/progress
router.patch('/:id/progress', async (req, res) => {
  try {
    const db = req.app.get('db');

    const userId = String(res.locals.oauth?.token?.user?.user_id || '').trim();
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Accept incLoss from the request body
    const { delta = 0, incWin = false, incLoss = false } = req.body || {};

    // Dynamically build the increment object
    const incObject = {};

    if (delta !== 0) incObject.level = delta;
    if (incWin) incObject.wins = 1;
    if (incLoss) incObject.losses = 1; // New field incremented here

    const update = { $inc: incObject };

    const filter = {
      _id: new ObjectId(req.params.id)
    };

    // 1) Update the document
    const r = await db.collection('cat').updateOne(filter, update);

    if (r.matchedCount === 0) {
      return res.status(404).json({ message: 'Cat not found' });
    }

    // 2) Return the updated record
    const doc = await db.collection('cat').findOne(filter);
    return res.json(doc);
  } catch (err) {
    console.error('Update error:', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

export default router;