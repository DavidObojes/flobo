export const checkLogin = (req, res, next) => {
  if (req.params.isLoggedIn === 'true') {
    next();
  } else {
    res.status(403).send({ error: 'Forbidden' });
  }
};
