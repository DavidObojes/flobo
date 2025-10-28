// api.js:
import express from 'express';
import user from './user.js';
import cat from './cat.js';
import {checkLogin} from "../middleware/checkLogin.js";

const router = express.Router();

//API - Test Route
router.get('/', (req,res,next) => {
  res.json({api: 'working'})
})

//Secret Test Route
router.get('/secret',checkLogin, (req, res,next) => {
  res.send('This is secret!');
});

// API - User Routes
router.use('/user/', user)
router.use('/cat/', cat);

export default router;