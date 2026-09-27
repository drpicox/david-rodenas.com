import { describe, expect, it } from "vitest";
import { aProgram } from "./aProgram";
import { inputSchemaOf } from "./inputSchemaOf";

describe("the form an agent fills in", () => {
  it("is a JSON schema of numbers, each with its range, its start and what it means", () => {
    const schema = inputSchemaOf(aProgram);
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties["rate"]).toEqual({ type: "number", minimum: 0, maximum: 20, default: 10, description: "Rate: yearly interest, in percent" });
  });

  it("offers a choice as the list of its names", () => {
    expect(inputSchemaOf(aProgram).properties["paid"]).toEqual({ type: "string", enum: ["once a year", "every month"], default: "once a year", description: "Paid: how often the interest is added" });
  });

  it("asks for nothing: whatever is left out keeps its initial value", () => {
    expect(inputSchemaOf(aProgram).required).toEqual([]);
  });
});
