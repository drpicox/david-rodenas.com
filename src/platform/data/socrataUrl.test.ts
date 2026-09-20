import { describe, expect, it } from "vitest";
import { socrataUrl } from "./socrataUrl";

describe("a question put to the open data portal", () => {
  it("names the dataset and carries each clause as a $parameter", () => {
    const url = new URL(socrataUrl("tasf-thgu", { select: "count(*) as n", where: "contaminant='NO2'", limit: 10 }));
    expect(url.origin + url.pathname).toBe("https://analisi.transparenciacatalunya.cat/resource/tasf-thgu.json");
    expect(url.searchParams.get("$select")).toBe("count(*) as n");
    expect(url.searchParams.get("$where")).toBe("contaminant='NO2'");
    expect(url.searchParams.get("$limit")).toBe("10");
  });

  it("survives what station names are made of", () => {
    const url = new URL(socrataUrl("tasf-thgu", { where: "nom_estacio='Barcelona (Gràcia - Sant Gervasi) & co'" }));
    expect(url.searchParams.get("$where")).toBe("nom_estacio='Barcelona (Gràcia - Sant Gervasi) & co'");
  });
});
