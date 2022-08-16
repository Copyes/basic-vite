import fs from 'fs';
import path from 'path';

export const __dirname = path.resolve(path.dirname(''));

export const resolvePath = (filepath) => {
  return path.join(__dirname, `/${filepath}`);
};
// 获取vite的全局配置文件
export const getViteConfig = () => {
  return JSON.parse(fs.readFileSync(resolvePath('vite.config.json'), 'utf8'));
};
