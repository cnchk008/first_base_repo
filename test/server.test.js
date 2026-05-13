import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { handleRequest, resolvePublicFile } from "../src/server.js";

describe("server", () => {
  it("resolves the home page", async () => {
    const file = await resolvePublicFile("/");

    assert.ok(file.endsWith("public/index.html"));
  });

  it("blocks path traversal", async () => {
    const file = await resolvePublicFile("/../package.json");

    assert.equal(file, null);
  });

  it("responds to health checks", async () => {
    const { body, statusCode } = await requestHandler("/health");

    assert.equal(statusCode, 200);
    assert.deepEqual(JSON.parse(body), { ok: true });
  });
});

function requestHandler(path) {
  return new Promise((resolve, reject) => {
    const response = {
      statusCode: 0,
      body: "",
      writeHead(statusCode) {
        this.statusCode = statusCode;
      },
      end(chunk = "") {
        this.body += chunk;
        resolve({ body: this.body, statusCode: this.statusCode });
      }
    };

    handleRequest({ url: path }, response).catch(reject);
  });
}
