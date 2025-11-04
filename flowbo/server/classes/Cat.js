export default class Cat {

  userId
  name
  imageUrl
  stats = {
    clawPower: 0,   //Attack damage
    zoomSpeed: 0,   //Dodge / Crit chance
    furDensity: 0,  //Defense / Armor
    cuteness: 0,   //Debuff enemy / morale
    chaosLuck: 0    //randomly modifies another stat per round (the higher the better)
  }
  xp
  level
  wins
  losses

  constructor(userId, name, imageUrl, stats = {}, xp = 0, level = 0, wins = 0, losses = 0) {
    this.userId = userId
    this.name = name
    this.imageUrl = imageUrl
    this.stats = stats
    this.xp = xp
    this.level = level
    this.wins = wins
    this.losses = losses
  }


 static generateRandomStats() {

    let randomPoints = 15

    const keys = ["clawPower","zoomSpeed","furDensity","cuteness","chaosLuck"]
    const stats = {}

    for (let key of keys) {
      stats[key] = 0;
    }

    while (randomPoints > 0) {
      let randomKey = keys[Math.floor(Math.random() * keys.length)]
      stats[randomKey]++
      console.log(randomKey + ": " + stats[randomKey])

      randomPoints--
    }

    return stats;
  }
}