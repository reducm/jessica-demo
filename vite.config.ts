import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { devPlugin } from "./plugins/devPlugin"
import optimizer from 'vite-plugin-optimizer';

// 通过optimizer，把原生node和electron的库打包到vue开发者工具和正式环境

const getReplacer: Function = ()=> {
  let externalModels = ["os", "fs", "path", "events", "child_process", "crypto", "http", "buffer", "url", "better-sqlite3", "knex"];
  let result = {};
  for (let item of externalModels) {
    result[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: `const ${item} = require('${item}');export { ${item} as default }`,
    });
  }
  result["electron"] = () => {
    let electronModules = ["clipboard", "ipcRenderer", "nativeImage", "shell", "webFrame"].join(",");
    return {
      find: new RegExp(`^electron$`),
      code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
    };
  };
  return result;
} 


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    optimizer(getReplacer()),
    devPlugin(),
    vue()
  ],
})
