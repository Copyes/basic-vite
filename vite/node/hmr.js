import chokidar from 'chokidar';
import fs from 'fs';

import { resolveOnRoot, __dirname } from './utils.js';

export const hmr = (ws, config) => {
  chokidar.watch(resolveOnRoot('src')).on('change', (changePath) => {
    let filePath = changePath.replace(__dirname, '');
    console.log(`${filePath} has changed`);
    const cssObj = {};

    if (filePath.endsWith('.css')) {
      cssObj.css = fs.readFileSync(resolveOnRoot(filePath)).toString();
    }

    ws.send(
      JSON.stringify({
        type: 'change',
        filePath,
        ...cssObj,
      })
    );
  });
};
