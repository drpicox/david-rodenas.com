import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { formerAddresses } from "./formerAddresses";

const page = (file: string, was?: string) => ({ file, markdown: `---\ntitle: T\n${was ? `was: ${was}\n` : ""}---\n\nText.` });

describe("the addresses a page used to have", () => {
  it("are whatever its front matter says it was, each leading to where it is now", () => {
    const site = new Site([page("index.md"), page("open-source/index.md", "/code/"), page("open-source/packages.md", "/projects/packages/, /npm")]);
    expect(formerAddresses(site)).toEqual([
      { from: "/code/", to: "/open-source/" },
      { from: "/projects/packages/", to: "/open-source/packages/" },
      { from: "/npm/", to: "/open-source/packages/" },
    ]);
  });

  it("never shadow a page that is there now: the living page wins", () => {
    const site = new Site([page("code/index.md"), page("open-source/index.md", "/code/")]);
    expect(formerAddresses(site)).toEqual([]);
  });
});
