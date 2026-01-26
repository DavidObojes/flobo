import type { Cat } from "../types/cat";

type Buffs = {
  nextDamageMult?: number;   // z.B. Rage
  nextDodgePenalty?: number; // z.B. Stumble
};

export type BattleLogEntry = {
  round: number;
  attackerId: string;
  defenderId: string;
  text: string;
};

export type BattleResult = {
  winnerId: string;
  loserId: string;
  log: BattleLogEntry[];
  final: Record<string, { hp: number; maxHp: number }>;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const maxHP = (c: Cat) => 80 + c.stats.furDensity * 10;

const dodgeChance = (c: Cat, buffs?: Buffs) => {
  const base = c.stats.zoomSpeed * 0.03; // 0.03 => 1 speed ~3%
  const penalty = buffs?.nextDodgePenalty ?? 0;
  return clamp(base - penalty, 0, 0.6);
};

const armorReduction = (c: Cat) => clamp(c.stats.furDensity * 0.04, 0, 0.7);

const recoilChance = (defender: Cat) => clamp(defender.stats.cuteness * 0.02, 0, 0.5);

const critChance = (attacker: Cat) => clamp(attacker.stats.chaosLuck * 0.02, 0, 0.35);
const critMultiplier = (attacker: Cat) => 1.5 + attacker.stats.chaosLuck * 0.02;

function roll(p: number) {
  return Math.random() < p;
}

function chaosEvent(attacker: Cat): { log?: string; buffs?: Buffs } {
  // chaosLuck => event chance (z.B. bis 25%)
  const eventChance = clamp(attacker.stats.chaosLuck * 0.015, 0, 0.25);
  if (!roll(eventChance)) return {};

  // 50/50 guter/schlechter event
  if (roll(0.5)) {
    return {
      log: `${attacker.name} verfällt in Rage (+20% Schaden nächste Attacke).`,
      buffs: { nextDamageMult: 1.2 },
    };
  }
  return {
    log: `${attacker.name} stolpert (-15% Ausweichen nächste Runde).`,
    buffs: { nextDodgePenalty: 0.15 },
  };
}

function computeDamage(attacker: Cat, _defender: Cat, attackerBuffs?: Buffs) {
  // Basis-Schaden
  let dmg = attacker.stats.clawPower * 8; // Skalierung
  // kleines Random
  dmg *= 0.9 + Math.random() * 0.2; // 0.9–1.1

  // Chaos Buff (Rage)
  if (attackerBuffs?.nextDamageMult) dmg *= attackerBuffs.nextDamageMult;

  // Crit?
  if (roll(critChance(attacker))) {
    dmg *= critMultiplier(attacker);
    return { dmg, crit: true };
  }

  return { dmg, crit: false };
}

export function simulateBattle(a: Cat, b: Cat): BattleResult {
  const hp: Record<string, number> = {
    [a._id!]: maxHP(a),
    [b._id!]: maxHP(b),
  };
  const maxHp: Record<string, number> = {
    [a._id!]: maxHP(a),
    [b._id!]: maxHP(b),
  };

  const buffs: Record<string, Buffs> = {
    [a._id!]: {},
    [b._id!]: {},
  };

  const log: BattleLogEntry[] = [];
  let round = 1;

  const attack = (attacker: Cat, defender: Cat) => {
    const attackerId = attacker._id!;
    const defenderId = defender._id!;

    // Chaos event roll at attack start
    const ce = chaosEvent(attacker);
    if (ce.log) {
      log.push({ round, attackerId, defenderId, text: ce.log });
      buffs[attackerId] = { ...buffs[attackerId], ...ce.buffs };
    }

    // Defender dodges?
    const dChance = dodgeChance(defender, buffs[defenderId]);
    if (roll(dChance)) {
      log.push({ round, attackerId, defenderId, text: `${defender.name} weicht aus!` });
      // "Stumble" penalty is consumed after it applies
      buffs[defenderId].nextDodgePenalty = 0;
      // also consume rage
      buffs[attackerId].nextDamageMult = 0;
      return;
    }
    buffs[defenderId].nextDodgePenalty = 0;

    if (roll(recoilChance(defender))) {
      const selfDmg = attacker.stats.clawPower * 3;
      hp[attackerId] = Math.max(0, hp[attackerId] - selfDmg);
      log.push({
        round,
        attackerId,
        defenderId,
        text: `${defender.name} ist zu cute — ${attacker.name} verletzt sich selbst (-${selfDmg.toFixed(0)} HP)!`,
      });
      buffs[attackerId].nextDamageMult = 0;
      return;
    }

    // Hit: damage with armor reduction
    const { dmg, crit } = computeDamage(attacker, defender, buffs[attackerId]);
    buffs[attackerId].nextDamageMult = 0;

    const reduced = dmg * (1 - armorReduction(defender));
    hp[defenderId] = Math.max(0, hp[defenderId] - reduced);

    log.push({
      round,
      attackerId,
      defenderId,
      text: `${attacker.name} trifft ${defender.name}${crit ? " (CRIT!)" : ""} für -${reduced.toFixed(0)} HP.`,
    });
  };

  // fight loop
  while (hp[a._id!] > 0 && hp[b._id!] > 0 && round <= 50) {
    // A attacks
    attack(a, b);
    if (hp[b._id!] <= 0) break;

    // B attacks
    attack(b, a);
    if (hp[a._id!] <= 0) break;

    round++;
  }

  const winnerId = hp[a._id!] > 0 ? a._id! : b._id!;
  const loserId = winnerId === a._id! ? b._id! : a._id!;

  return {
    winnerId,
    loserId,
    log,
    final: {
      [a._id!]: { hp: hp[a._id!], maxHp: maxHp[a._id!] },
      [b._id!]: { hp: hp[b._id!], maxHp: maxHp[b._id!] },
    },
  };
}
