import Koa from 'koa';
import { WebSocketServer } from 'ws';
import { getViteConfig } from './utils.js';

const app = new Koa();
const config = getViteConfig();

function createWS() {
  const wss = new WebSocketServer({ port: config.WS_PORT });
  wss.on('connection', (ws) => {
    console.log('ws is connected!');
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
      console.log(`listening：${config.SERVER_PORT} port`);
    }
  });
})();
