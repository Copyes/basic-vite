import fs from 'fs';
import path from 'path';

export const __dirname = path.resolve(path.dirname(''));

export const resolveOnRoot = (filepath) => {
  return path.join(__dirname, `/${filepath}`);
};
// 获取vite的全局配置文件
export const getViteConfig = () => {
  return JSON.parse(fs.readFileSync(resolveOnRoot('vite.config.json'), 'utf8'));
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
