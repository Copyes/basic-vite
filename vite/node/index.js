import Koa from 'koa';
import { WebSocketServer } from 'ws';
import { getViteConfig } from './utils.js';
import { hmr } from './hmr.js';
import {
  baseMiddleware,
  indexHtmlMiddleware,
  transformMiddleware,
} from './middleware.js';

const app = new Koa();
const config = getViteConfig();

function createWS() {
  const wss = new WebSocketServer({ port: config.WS_PORT });
  wss.on('connection', (ws) => {
    console.log('ws is connected!');
    hmr(ws, config);
    ws.on('message', (msg) => {
      console.log('received: %s', msg);
    });
  });
}

(function createServer() {
  createWS();
  app.listen(config.SERVER_PORT, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`listening: ${config.SERVER_PORT} port`);
    }
  });
  app.use(baseMiddleware);
  app.use(indexHtmlMiddleware);
  app.use(transformMiddleware);
})();
