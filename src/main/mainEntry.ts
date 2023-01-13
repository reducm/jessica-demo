import { app, BrowserWindow, ipcMain } from "electron"
import { Browser, BrowserContextOptions, chromium, LaunchOptions, firefox } from "playwright"
import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import axios from 'axios'

const host = "http://127.0.0.1:3001"


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true"

// let browser: Browser;
// let contextConfig: BrowserContextOptions = {
//     colorScheme: "dark",
//     viewport: {
//         width: 1280,
//         height: 800,
//     }
// }

// chromium.launch().then(async (browser)=> {
//     let browserContext = await browser.newContext(contextConfig);
//     let page = await browserContext.newPage();
//     await page.goto("http://comparev-admin.vip.vip.com/flowReplay/agent")
//     page.pause()
// })

let mainWindow: BrowserWindow;

app.whenReady().then(async () => {
    let config = {
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            contextIsolation: false,
            webviewTag: true,
            spellcheck: false,
            disableHtmlFullscreenWindowResize: true,
        },
    }

    // nodeIntegration配置项的作用是把 Node.js 环境集成到渲染进程中，contextIsolation配置项的作用是在同一个 JavaScript 上下文中使用 Electron API。其他配置项与本文主旨无关，大家感兴趣的话可以自己翻阅官方文档。
    // webContents的openDevTools方法用于打开开发者调试工具

    mainWindow = new BrowserWindow(config)
    mainWindow.webContents.openDevTools({ mode: "undocked" })
    mainWindow.loadURL(process.argv[2])

    mainWindow.webContents.on("did-finish-load", () => {
        get_list((resp: any) => {
            mainWindow.webContents.send("REFRESH_LIST", resp.data)
        })
    })
});



const sub_process: Array<ChildProcess> = []

// ipcMain.on("needCodeChange", async (event, count)=> {
//     console.log("needCodeChange[main]", count);
//     mainWindow.webContents.send("CODE_CHANGE", count, count)
// })

const get_list = (callback: Function) => {
    axios.get(`${host}/codes`)
        .then((resp) => {
            // console.log("axios get", { data: resp.data })
            callback(resp)
        })
        .catch((err) => console.error(err))

}

ipcMain.on("test", (event, count) => {
    get_list((resp: any) => console.log("all:", resp))
})

ipcMain.on("showRecorder", async (event, hello, count) => {

    mainWindow.webContents.send("CODE_CHANGE", "init MESSAGE")

    const proc = spawn("node", [
        // "--inspect-brk",
        "./src/main/pw.js",
        "http://douban.com"
    ], {
        cwd: process.cwd(),
        shell: true,
        stdio: ['ipc']
    });
    sub_process.push(proc)

    proc?.stdout?.on("data", (data) => {
        console.log("childProcess: " + data); //this works
    });

    proc.stderr?.on("data", (data) => {
        console.log("childProcessError: " + data);
    })


    proc.on("close", (err) => {
        console.log("子调用close", { err })
    })

    proc.on("message", (message: any) => {
        // const message = JSON.parse(jsonString);
        console.log({ message });

        if (message.key == "CODE_CHANGE") {
            console.log("code_change", message.value);
            mainWindow.webContents.send("CODE_CHANGE", message.value)
        }
    })

    // //inside example.spec.js(playwright test file)
    // process.send("Hello from child") // doesn't work
})

ipcMain.on("close_all", (event, count) => sub_process.forEach((p) => p.kill(9)))

ipcMain.on("upload", (event, code: string) => {
    console.log("code in upload[main]", code);
    axios.post(`${host}/code`, { code }, { responseType: "json" })
        .then((resp) => console.log("axios get", { data: resp.data }))
        .catch((err) => console.error(err))

    get_list((resp: any) => {
        mainWindow.webContents.send("REFRESH_LIST", resp.data)
    })

})

app.on("quit", () => {
    console.log("close all subProcess");
    sub_process.forEach((p) => p.kill(9))
})


// ipcMain.on("showRecorder", async (event, hello, count) => {
//     console.log("inMain!!!", { event, hello, count });
//     const browser = await firefox.launch({ headless: false });
//     // Setup context however you like.
//     const context = await browser.newContext({ /* pass any options */ });
//     await context.route('**/*', route => route.continue());

//     // Pause the page, and start recording manually.
//     const page = await context.newPage();
//     await page.goto("http://www.douban.com")
//     await page.pause()

// })

// spawn shell
// ipcMain.on("showRecorder", async (event, hello, count) => {
//     console.log({ event, hello, count });
//     const proc = spawn("npx", ["playwright", "codegen", "douban.com"], {
//         shell: true,
//         stdio: ['ipc']
//     });

//     proc?.stdout?.on("data", (data) => {
//         console.log("stdout: " + data); //this works
//     });
//     proc.on('message', function (message) {
//         console.log(message) // this doesn't work
//     })
//     // //inside example.spec.js(playwright test file)
//     // process.send("Hello from child") // doesn't work
// })
