import fs from 'fs';
import path from 'path';
import { buildSync, transformSync } from 'esbuild';

export const __dirname = path.resolve(path.dirname(''));

export const resolveOnRoot = (filepath) => {
  return path.join(__dirname, `/${filepath}`);
};
// 获取vite的全局配置文件
export const getViteConfig = () => {
  return JSON.parse(fs.readFileSync(resolveOnRoot('vite.config.json'), 'utf8'));
};

// 处理node_modules
export const hadnleModules = (ctx, requestUrl) => {
  const moduleName = requestUrl.replace('/@modules/', '');
  const entryFileName = JSON.parse(
    fs.readFileSync(
      `${__dirname}/node_modules/${moduleName}/package.json`,
      'utf8'
    )
  ).main;

  const filePath = `${__dirname}/node_modules/${moduleName}/${entryFileName}`;
  let body = {};

  try {
    body = fs.readFileSync(
      `${__dirname}/node_modules/.cvite/${moduleName}.js`,
      'utf8'
    );
  } catch (err) {
    buildSync({
      entryPoints: [filePath],
      outfile: `${__dirname}/node_modules/.cvite/${moduleName}.js`,
      format: 'esm',
      bundle: true,
    });

    body = fs.readFileSync(
      `${__dirname}/node_modules/.cvite/${moduleName}.js`,
      'utf8'
    );
  }

  ctx.type = 'application/javascript';
  ctx.body = body;
};

export const handleCSS = (ctx, requestUrl) => {
  const filePath = resolveOnRoot(requestUrl);
  const cssContent = JSON.stringify(fs.readFileSync(filePath).toString());

  const injectCSS = `
    import { globalUpdateStyle } from '/@vite/client/style.js';
    globalUpdateStyle('${requestUrl}', '${cssContent}');
  `;
  ctx.type = 'text/css';
  ctx.body = injectCSS;
};

export const handleJSX = (ctx, requestUrl) => {};
