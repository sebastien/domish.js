

import { describe, test, expect } from "bun:test";
import server from "../domish/server.js";
describe("server module exports", () => {
  test("exports DOM types", () => {
    expect(server.Node).toBeDefined();
    expect(server.Element).toBeDefined();
    expect(server.Document).toBeDefined();
    expect(server.document).toBeDefined();
  });
  test("exports XML parse function", () => {
    expect(typeof server.parse).toBe("function");
  });
  test("parse works via server export", () => {
    const doc = server.parse("<div>test</div>");
    expect(doc).toBeDefined();
    expect(doc.body.querySelector("div")).not.toBeNull();
  });
  test("document creates elements via server export", () => {
    const el = server.document.createElement("span");
    expect(el).toBeDefined();
    expect(el.nodeName).toBe("span");
  });
  test("merged exports include all DOM and XML APIs", () => {
    expect(server.Node).toBeDefined();
    expect(server.Element).toBeDefined();
    expect(server.Document).toBeDefined();
    expect(server.document).toBeDefined();
    expect(server.parse).toBeDefined();
    expect(server.parseAttributes).toBeDefined();
  });
});
