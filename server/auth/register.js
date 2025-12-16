// register.js
import express from 'express';
import { v4 } from 'uuid'
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const db = req.app.get('db');

    // TODO: validate req.body (email)
    const email = req.body.email;
    if(!email) {
      res.status(500).send({ message: "Oops, something went wrong" });
      return;
    }

    const insertion = await db.collection('user_auth').insertOne({ username: req.body.email });
    if (insertion.acknowledged) {
      const token = v4();
      const tokenInsertion = await db.collection('token').insertOne({
        emailToken: token,
        emailTokenExpiresAt: new Date(Date.now() + (1000 * 60 * 60)), // now plus 60 minutes
        user_id: insertion.insertedId,
      });

      if (tokenInsertion.acknowledged) {
        // TODO: send url with token by email instead of logging it to console
        console.log(`Activation link: http://localhost:5173/activate/${token}`);

        res.status(201).send({ message: "Success" });
      } else {
        res.status(500).send({ message: "Oops, something went wrong" });
      }
    } else {
      res.status(500).send({ message: "Oops, something went wrong" });
    }
  } catch(err) {
    console.error(err);
    res.status(500).send({ message: "Oops, something went wrong" });
  }
});

router.put('/:token', async (req, res) => {
  try {
    const db = req.app.get('db');
    // TODO: validate req.body (first_name, last_name, password)

    const token = await db.collection('token').findOne({ emailToken: req.params.token });
    if (token) {
      const insertion = await db.collection('user').insertOne({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        permissions: { write: false },
      });

      if (insertion.acknowledged) {
        const updated = await db.collection('user_auth').updateOne({ _id: token.user_id }, { $set: {
          password: await bcrypt.hash(req.body.password, 10),
          user_id: insertion.insertedId
        } });
        if (updated.modifiedCount === 1) {
          await db.collection('token').deleteOne({ emailToken: req.params.token });

          res.status(200).send();
        } else {
          res.status(500).send();
        }
      } else {
        res.status(500).send();
      }
    } else {
      res.status(401).send();
    }
  } catch(err) {
    console.error(err);
    res.status(500).send();
  }
});


export default router;
