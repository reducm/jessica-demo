const { chromium } = require('playwright');
const { isJsxAttribute } = require('typescript');
const EventEmitter = require("events").EventEmitter;



(async () => {
  // Make sure to run headed.
  const codeChangeEvent = new EventEmitter();
  // 演示用注册全局event方便hack代码
  global.codeChangeEvent = codeChangeEvent

  codeChangeEvent.on("CODE_CHANGE", (source) => {
    try {
      console.log("sub CODE_CHANGE in pwjs", {source});
      process.send({
        key: "CODE_CHANGE",
        value: source,
      });
    } catch (error) {
      console.error(error)
    }
  });

  const browser = await chromium.launch({ 
    headless: false,
  });
  // Setup context however you like.
  const context = await browser.newContext({});

  try {
    console.log(JSON.stringify(process.argv))
    process.send(JSON.stringify(process.argv));
  } catch (error) {
    console.error(error)
  }


  try {
    // await context.route('**/*', route => route.continue());
    // Pause the page, and start recording manually.
    const page = await context.newPage();
    await page.goto(process.argv[2]);

    const locator = await page.getByLabel('title');
    // const title = await locator.innerText();
    // console.log('获取到的title:', title);

    await page.pause();


    // process.send(title)
    // process.exit()

  } catch (error) {
    console.error('SubProcess Error', error);
    // process.send(error)
  }

})();


