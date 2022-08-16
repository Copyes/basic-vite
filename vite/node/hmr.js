import chokidar from 'chokidar';
import fs from 'fs';

import { resolveOnRoot, __dirname } from './utils.js';

export const hmr = (ws, config) => {
  chokidar.watch(resolveOnRoot('src')).on('change', (changePath) => {
    let file = changePath.replace(__dirname, '');
    console.log(`${file} has changed`);
    const cssObj = {};

    if (changePath.endsWith('.css')) {
      cssObj.css = fs.readFileSync(resolveOnRoot(changePath)).toString();
    }

    ws.send(
      JSON.stringify({
        type: 'change',
        changePath,
        ...cssObj,
      })
    );
  });
};
