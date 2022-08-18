import fs from 'fs';
import {
  resolveOnRoot,
  __dirname,
  handleCSS,
  handleJSX,
  hadnleModules,
} from './utils.js';

export const baseMiddleware = (ctx, next) => {
  const requestUrl = ctx.request.url.split('?')[0];
  ctx.requestUrl = requestUrl;
  next();
};

export const indexHtmlMiddleware = (ctx, next) => {
  if (ctx.requestUrl === '/') {
    const html = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');
    const injectStyleFile =
      '<script type="module" src="/@vite/client/style.js"></script>';
    const injectWsFile =
      '<script type="module" src="/@vite/client/ws.js"></script>';
    const injectRefreshReact = `
    <script type="module">
      import RefreshRuntime from "/@modules/react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>`;
    ctx.type = 'text/html';
    ctx.body = `${injectRefreshReact}${injectStyleFile}${injectWsFile}${html}`;
  }
  next();
};

export const transformMiddleware = (ctx, next) => {
  const { requestUrl } = ctx;
  // if (requestUrl.startsWith('/@modules/')) {
  //   handleNodeModules(ctx, requestUrl);
  // }
  if (requestUrl.startsWith('/@vite/client')) {
    ctx.type = 'application/javascript';
    const filePath = requestUrl.replace('/@vite/client', 'vite/client');
    ctx.body = fs.readFileSync(resolveOnRoot(filePath), 'utf8');
  } else if (requestUrl.startsWith('/@modules/')) {
    hadnleModules(ctx, requestUrl);
  } else if (requestUrl.endsWith('.css')) {
    handleCSS(ctx, requestUrl);
  } else if (requestUrl.endsWith('.jsx')) {
    handleJSX(ctx, requestUrl);
  }
  next();
};
