const fs = require("fs");
const path = require("path");
const intersection = (a, b) => {
   const s = new Set(b);
   return [...new Set(a)].filter(x => s.has(x));
};
function copy(originalUrl, targetUrl) {
   debugger;
   try {
      const STATUS = fs.statSync(originalUrl);
      const fileName = originalUrl.split(path.sep)[originalUrl.split(path.sep).length - 1];
      if (STATUS.isFile()) {
         fs.writeFileSync(`${targetUrl}${path.sep}${fileName}`, fs.readFileSync(originalUrl));

      } else if (STATUS.isDirectory()) {
         fs.mkdirSync(`${targetUrl}${path.sep}${fileName}`);
         fs.readdirSync(originalUrl).map(item => {
            move(`${originalUrl}${path.sep}${item}`, `${targetUrl}${path.sep}${fileName}`);
         });
      }
   } catch (error) {
      console.log(error)
      console.log("路径" + "有误");
   }
}
function move(originalUrl, targetUrl) {

   copy(originalUrl, targetUrl);
   // remove(originalUrl);
};

function remove(url) {

   const STATUS = fs.statSync(url);

   if (STATUS.isFile()) {

      fs.unlinkSync(url);

   } else if (STATUS.isDirectory()) {
      fs.readdirSync(url).map(item => {

         remove(`${url}${path.sep}${item}`);
      });

      fs.rmdirSync(url);
   };
};
function relocate(form) {
   const base = path.resolve(form, '..');
   const newPath = path.join(base, Date.now().toString());
   fs.renameSync(form, newPath);
   const list = fs.readdirSync(newPath);
   list.map(item => {
      move(path.join(newPath, item), base);
   })
   // fs.rmdirSync(newPath);
}
function cleck(paths) {
   debugger;
   const targetFiles = fs.readdirSync(path.resolve(paths[0], '..'));
   const files = paths.map(path => {
      return fs.readdirSync(path);
   }).flatMap(files => files);
   return Array.from(new Set(files)).length === files.length && intersection(targetFiles, files).length === 0;
}
function start(action) {
   action.payload.map(dis => {
      const path = dis.path;
      relocate(path);
   })
   utools.outPlugin();
   utools.hideMainWindow()
}
window.exports = {
   "liberationDirectory": {
      mode: "none",
      args: {
         enter: (action) => {
            if (!action.payload.length) {
               return;
            }
            const paths = action.payload.map(dis => dis.path);
            if (!cleck(paths)) {
               const id = utools.showMessageBox({
                  type: 'question',
                  buttons: ['取消', '继续'],
                  title: '重名文件',
                  message: '当前释放的文件夹存在重名文件或文件夹',
                  defaultId: 1
               })
               if (!id) {
                  utools.outPlugin();
                  utools.hideMainWindow()
                  return;
               }
            }
            start(action);
         }
      }
   }
}