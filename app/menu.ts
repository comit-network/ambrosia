/* eslint @typescript-eslint/ban-ts-ignore: off */
import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import fs from 'fs';

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

    const template = [];

    // File Menu
    template.push({
      label: '&File',
      submenu: [
        {
          label: 'Reset config',
          click: () => {
            // TODO: let the user confirm this with a dialog, need IPC for that
            const configPath = path.join(
              app.getPath('userData'),
              'config.json'
            );

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
    });

    // The menu items below are necessary to support keyboard shortcuts on mac

    // Edit Menu
    template.push({
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    });
    // View Menu
    template.push({
      label: 'View',
      submenu: [{ role: 'togglefullscreen' }]
    });
    // Window menu
    template.push({
      role: 'window',
      submenu: [{ role: 'minimize' }, { role: 'close' }]
    });

    if (process.platform === 'darwin') {
      // Window menu
      template[3].submenu = [
        { role: 'close' },
        { role: 'minimize' },
        { type: 'separator' },
        { role: 'front' }
      ];
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    return template;
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
