import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_SERVER_PATH = join(__dirname, "..", "..", "mcp-server", "server.js");

let clientPromise = null;

// Spawns mcp-server/server.js once (over stdio) and reuses the same
// connection for every chat request.
function connect() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [MCP_SERVER_PATH],
    env: { ...process.env, API_BASE: process.env.API_BASE ?? `http://localhost:${process.env.PORT || 4001}/api` },
  });
  const client = new Client({ name: "inventory-backend-ai", version: "1.0.0" });
  return client.connect(transport).then(() => client);
}

function getClient() {
  if (!clientPromise) {
    clientPromise = connect().catch((err) => {
      clientPromise = null; // allow retry on the next call
      throw err;
    });
  }
  return clientPromise;
}

export async function listMcpTools() {
  const client = await getClient();
  const { tools } = await client.listTools();
  return tools;
}

export async function callMcpTool(name, args) {
  const client = await getClient();
  return client.callTool({ name, arguments: args });
}
