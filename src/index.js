const { app, shell, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");

let mainWindow = null;
let tray = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// Single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      } else if (!mainWindow.isVisible()) {
        mainWindow.show();
        if (!tray.isDestroyed()) {
          tray.destroy();
        }
      }
      mainWindow.focus();
    }
  });

  Menu.setApplicationMenu(null);
  app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      icon: path.join(__dirname, "resources", "icon.png"),
    });
    mainWindow.loadURL("https://www.notion.so/login");
    mainWindow.on("close", (event) => {
      event.preventDefault();
      mainWindow.hide();
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      // Use system browser to open external link
      if (url != mainWindow.webContents.getURL()) {
        shell.openExternal(url);
      }
      return { action: "deny" };
    });

    tray = new Tray(path.join(__dirname, "resources", "icon.png"));
    tray.setToolTip("Notron");
    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: "Show",
          click: () => {
            mainWindow.show();
          },
        },
        {
          label: "Exit",
          click: () => {
            if (process.platform !== "darwin") {
              mainWindow.destroy();
              app.quit();
            }
          },
        },
      ])
    );
    tray.on("click", () => {
      mainWindow.show();
    });
  });
}
