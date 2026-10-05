import { describe, expect, it } from "vitest";
import { Pending } from "../../blueprint/Pending";
import { FilesInBrowser } from "./FilesInBrowser";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("the files a blueprint reads in the browser", () => {
  it("are asked for once, waited on, and read at once when here", async () => {
    const asked: string[] = [];
    const files = new FilesInBrowser(async (path) => {
      asked.push(path);
      return `text of ${path}`;
    });
    let told = 0;
    files.listen(() => (told += 1));
    expect(() => files.read("/data/a.json")).toThrow(Pending);
    expect(() => files.read("/data/a.json")).toThrow(Pending);
    await tick();
    expect(files.read("/data/a.json")).toBe("text of /data/a.json");
    expect(asked).toEqual(["/data/a.json"]);
    expect(told).toBe(1);
  });

  it("say a file that is not there is not there, once it is known", async () => {
    const files = new FilesInBrowser(() => Promise.reject(new Error("404")));
    expect(() => files.read("/data/running.json")).toThrow(Pending);
    await tick();
    expect(() => files.read("/data/running.json")).toThrow("there is no /data/running.json");
  });

  it("stop telling whoever stops listening", async () => {
    const files = new FilesInBrowser(async () => "x");
    let told = 0;
    const stop = files.listen(() => (told += 1));
    stop();
    expect(() => files.read("/a")).toThrow(Pending);
    await tick();
    expect(told).toBe(0);
  });
});
