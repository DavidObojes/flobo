export default class Cat {
  _id
  userId
  name
  imageUrl

  stats = {
    clawPower: 0,
    zoomSpeed: 0,
    furDensity: 0,
    cuteness: 0,
    chaosLuck: 0,
  }

  xp = 0
  level = 1
  unspentPoints = 0
  wins = 0
  losses = 0

  constructor({
    _id,
    userId,
    name,
    imageUrl,
    stats = {},
    xp = 0,
    level = 1,
    unspentPoints = 0,
    wins = 0,
    losses = 0,
  } = {}) {
    this._id = _id
    this.userId = userId
    this.name = name
    this.imageUrl = imageUrl

    this.stats = { ...this.stats, ...stats }

    this.xp = xp
    this.level = level
    this.unspentPoints = unspentPoints
    this.wins = wins
    this.losses = losses
  }
}
