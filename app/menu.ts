/* eslint @typescript-eslint/ban-ts-ignore: off */
import { app, BrowserWindow, Menu } from 'electron';
import path from "path";
import fs from "fs";

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const menu = Menu.buildFromTemplate([
      {
        label: '&File',
        submenu: [
          {
            label: 'Reset config',
            click: () => {
              // TODO: let the user confirm this with a dialog, need IPC for that
              const configPath = path.join(app.getPath('userData'), "config.json");

              if (fs.existsSync(configPath)) {
                fs.unlinkSync(configPath);
              }

              this.mainWindow.reload();
            }
          },
          {
            label: 'Exit',
            click: () => {
              app.quit();
            }
          }
        ]
      }
    ]);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          }
        }
      ]).popup({ window: this.mainWindow });
    });
  }
}
