import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "..");
const publicDir = join(rootDir, "public");

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"]
]);

export function createAppServer() {
  return createServer(handleRequest);
}

export async function handleRequest(request, response) {
  try {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");

    if (requestUrl.pathname === "/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    const filePath = await resolvePublicFile(requestUrl.pathname);

    if (!filePath) {
      sendText(response, 404, "Not found");
      return;
    }

    const type = contentTypes.get(extname(filePath)) ?? "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store"
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error(error);
    sendText(response, 500, "Internal server error");
  }
}

export async function resolvePublicFile(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = normalizedPath === "/" ? "/index.html" : normalizedPath;
  const filePath = resolve(publicDir, `.${requestedPath}`);

  if (!filePath.startsWith(publicDir)) {
    return null;
  }

  const fileStats = await stat(filePath).catch(() => null);

  if (!fileStats?.isFile()) {
    return null;
  }

  return filePath;
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, message) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  const host = process.env.HOST ?? "127.0.0.1";
  const server = createAppServer();

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Try PORT=${port + 1} node src/server.js`);
    } else if (error.code === "EPERM") {
      console.error("This environment does not allow opening a local server port.");
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  });

  server.listen(port, host, () => {
    console.log(`App running at http://${host}:${port}`);
  });
}
