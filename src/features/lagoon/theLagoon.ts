import type { Fisher } from "./Fisher";
import { starters } from "./starters";
import { titForTat } from "./titForTat";

/**
 * Who can be on the lagoon: the starter's four kinds of bot, and tit for tat
 * twice, so it can be seen cooperating with itself. The 40% bot starts on
 * the bank, because with it in the water the lagoon is empty by the third
 * week and there is nothing to watch; ticking it is the first thing to try.
 */
export function theLagoon(): { fisher: Fisher; seated: boolean }[] {
  return [
    { fisher: starters.one, seated: true },
    { fisher: starters.power, seated: true },
    { fisher: starters.percent(0.1), seated: true },
    { fisher: starters.percent(0.4), seated: false },
    { fisher: titForTat("Tit for tat"), seated: true },
    { fisher: titForTat("Tat for tit"), seated: true },
  ];
}
