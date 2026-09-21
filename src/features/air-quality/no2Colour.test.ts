import { describe, expect, it } from "vitest";
import { no2Colour } from "./no2Colour";

describe("the colour of an amount of NO2: good or bad at a glance", () => {
  it("is green with nothing in the air, and red exactly at the European limit of 40", () => {
    expect(no2Colour(0).background).toBe("rgb(0,255,0)");
    expect(no2Colour(40).background).toBe("rgb(255,0,0)");
  });

  it("passes through yellow halfway to the limit, and through purple on the way to twice it", () => {
    expect(no2Colour(20).background).toBe("rgb(225,225,0)");
    expect(no2Colour(60).background).toBe("rgb(225,0,225)");
    expect(no2Colour(80).background).toBe("rgb(64,0,64)");
  });

  it("blends between the colours it names", () => {
    expect(no2Colour(10).background).toBe("rgb(113,240,0)");
  });

  it("keeps darkening past twice the limit and never runs out", () => {
    expect(no2Colour(155).background).toBe("rgb(40,0,36)");
    expect(no2Colour(1000).background).toBe("rgb(16,0,8)");
  });

  it("says whether the number written on it has to be light to be read", () => {
    expect(no2Colour(10).light).toBe(false);
    expect(no2Colour(20).light).toBe(false);
    expect(no2Colour(40).light).toBe(true);
    expect(no2Colour(70).light).toBe(true);
  });
});
