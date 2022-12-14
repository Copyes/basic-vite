import { handleFile } from './utils.js';

const ws = new WebSocket(`ws://localhost:8080`);

ws.addEventListener('message', function incoming(target) {
  const data = JSON.parse(target.data);
  const { type, filePath, css } = data;
  console.log('ws-client: change');
  if (type === 'change') {
    handleFile(filePath, css);
  }
});
