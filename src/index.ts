import { createApp } from "@src/app.js";
import serverConfig from "@src/config/server.js";
import { Server } from "@src/server.js";

const server = new Server(await createApp());

await server.start(serverConfig.port);

console.info(`[server]: Server is running at ${server.url}`);

export default server;
