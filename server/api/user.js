// API - User
import express from 'express';
import {ObjectId} from "mongodb";

const router = express.Router();

//Get All User
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db'); // get reference to the db from app config
    const users = await db.collection('user').find({}).toArray();

    res.json(users);
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

//Get Logged In / Authenticated User
router.get('/authenticated', async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = String(res.locals.oauth?.token?.user?.user_id || '').trim();
    const user = await db.collection('user').findOne({ _id: new ObjectId(userId) });

    if (user) {
      res.json(user);
    } else {
      res.status(404).send();
    }
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

//Get Single User by Id
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const user = await db.collection('user').findOne({ _id: new ObjectId(req.params.id) });

    if (user) {
      res.json(user);
    } else {
      res.status(404).send();
    }
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

//Create User
router.post('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const insertion = await db.collection('user').insertOne(req.body);
    if (insertion.acknowledged) {
      const user = await db.collection('user')
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

//Update User
router.put('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');

    const updateData = req.body;
    delete updateData._id;

    const updated = await db.collection('user')
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    if (updated.modifiedCount === 1) {
      const user = await db.collection('user')
        .findOne({ _id: new ObjectId(req.params.id) });

      if (user) {
        res.json(user);
      } else {
        res.status(404).send();
      }
    } else {
      res.status(404).send();
    }
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

//Delete User
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const deleted = await db.collection('user')
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (deleted.deletedCount === 1) {
      res.send();
    } else {
      res.status(404).send();
    }
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});

export default router;