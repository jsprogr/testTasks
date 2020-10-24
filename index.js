const pptr = require('puppeteer');
const fs = require('fs');
const Path = require('path');

const link = process.argv[2];
const pathArg = process.argv[3];
let outPath;

fs.access(pathArg, function (err) {
  if (err && err.code === 'ENOENT') {
    fs.mkdir(pathArg, () => {});
  }
});

const launchOpts = {
  headless: false,
  defaultViewport: null,
  // devtools: true,
  // slowMo: 100,

  // userDataDir: '',
  args: ['--window-size=910,1080', '--disable-gpu'],
};
const pageOpts = {
  waitUntil: 'networkidle2',
};

(async () => {
  const bro = await pptr.launch(launchOpts);
  const page = await bro.newPage();
  await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: pathArg });

  console.log(`Переходим на страницу ${link}`);
  await page.goto(link, pageOpts);

  console.log('Удаляем лишний слой из DOM');
  await page.$eval('.welcome--tandc', (el) => {
    el.remove();
  });


  const fileName = await page.evaluate(() => document.querySelector('.file-system-entry__title').innerText)
  outPath = Path.resolve(pathArg, fileName)
  console.log('Скачиваем файл:', fileName, `в директорию ${outPath}`);
  if (fs.existsSync(outPath)) {
    console.log('Проверяем наличие одноименного файла:', fileName, `в директории ${outPath}`);
    fs.unlinkSync(outPath)
    console.log('удалили файл');
  }

  const btn = await page.$('.transfer__button');
  console.log('Жмякаем по кнопке скачать');
  await btn.click();
  

  setInterval(async ()=>{
    if (fs.existsSync(outPath)) {
      console.log('Файл:', fileName, ` загружен в директорию ${outPath}`);
      console.log('Работа программы завершена');
      await bro.close();
      process.exit()
    }
    console.log('Файл:', fileName, ` еще не загружен в директорию ${outPath}`);
  }, 1000)

})();


// fs.accessSync()
// node index.js  https://we.tl/t-uD5fn5vr2z   C:\work


