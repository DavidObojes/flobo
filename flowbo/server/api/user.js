// API - User
import express from 'express';

const router = express.Router();

// dummy data
const userData = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' }
];


//Get All User
router.get('/', (req, res) => {
  res.json(userData);
});


//Get Single User
router.get('/:id', (req, res) => {
  const user = userData.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send();
  }
});

//Create Single User
router.post('/', (req, res, next) => {
  const user = { id: 'c', name: 'Ceasar'}
  userData.push(user)
  res.json(user).status(201).send()
})

export default router;