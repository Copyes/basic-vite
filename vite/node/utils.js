import fs from 'fs';
import path from 'path';
import { buildSync, transformSync } from 'esbuild';

import reactRefresh from '../plugin/react-refresh.cjs';
const reactRefreshPlugin = reactRefresh();

export const __dirname = path.resolve(path.dirname(''));

// export const resolveOnRoot = (filepath) => {
//   return path.join(__dirname, `/${filepath}`);
// };

export const resolveOnRoot = (filePath) => path.join(__dirname, `/${filePath}`);

// 获取vite的全局配置文件
export const getViteConfig = () => {
  return JSON.parse(fs.readFileSync(resolveOnRoot('vite.config.json'), 'utf8'));
};
/**
 * 重写引用的第三方依赖的引用方式
 * content = import React from 'react'
 * s0 from 'react'    s1 = react
 */
function rewriteImport(content) {
  return content.replace(/ from ['"](.*)['"]/g, function (s0, s1) {
    if (s1.startsWith('./') || s1.startsWith('/') || s1.startsWith('../')) {
      // 原路径输出
      return s0;
    } else {
      // 修改裸模块路径
      return ` from '/@modules/${s1}'`;
    }
  });
}

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
    globalUpdateStyle('${requestUrl}', ${cssContent});
  `;
  ctx.type = 'application/javascript';
  ctx.body = injectCSS;
};

// 处理svg, 转base64
export const handleSvg = (ctx, requestUrl) => {
  const filePath = resolveOnRoot(requestUrl);
  const imageFile = fs.readFileSync(filePath);
  ctx.type = 'application/javascript';
  ctx.body = `export default 'data:image/svg+xml;base64,${Buffer.from(
    imageFile,
    'binary'
  ).toString('base64')}'`;
};

export function handleJSX(ctx, requestUrl) {
  let filePath = resolveOnRoot(requestUrl);
  console.log(filePath);
  const JSXFile = rewriteImport(fs.readFileSync(filePath).toString());

  const out = transformSync(JSXFile, {
    jsxFragment: 'Fragment',
    loader: 'jsx',
  });
  let realCode = out.code;

  // 自定义 import 为需要热更新
  if (ctx.request.url.split('?')[1]?.includes('import')) {
    realCode = out.code.replace(
      / from ['"](.*\.jsx.*)['"]/g,
      function rewriteCode(s0, s1) {
        return ` from '${s1}?import=${+new Date()}'`;
      }
    );
  }

  realCode = reactRefreshPlugin.transform(realCode, filePath);
  if (realCode.code) {
    realCode = realCode.code;
  }

  ctx.type = 'application/javascript';
  ctx.body = realCode;
}
