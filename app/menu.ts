/* eslint @typescript-eslint/ban-ts-ignore: off */
import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
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

    // this menu enables keyboard shortcuts for mac, without it the shortcuts won't be available on mac
    // see details here: https://github.com/onmyway133/blog/issues/67
    const edit: MenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          // @ts-ignore
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          // @ts-ignore
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          // @ts-ignore
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          // @ts-ignore
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          // @ts-ignore
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          // @ts-ignore
          selector: 'selectAll:'
        }
      ]
    };

    // @ts-ignore
    const file: MenuItemConstructorOptions = Menu.buildFromTemplate([
      {
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
      }
    ]);

    const menu = [file, edit];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
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
