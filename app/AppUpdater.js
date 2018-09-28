import { shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export default class AppUpdater {


  constructor() {
    this.timer = null;
    this.processing = false;
    this.autoUpdater = autoUpdater;

    log.transports.file.level = 'info';
    this.autoUpdater.logger = log;

    this.autoUpdater.setFeedURL({
      'provider': "github",
      'owner':    "policypalnet",
      'repo':     "pal-wallet",
    });

    this.autoUpdater.autoDownload = true;

    this.autoUpdater.on('checking-for-update', this.onCheckingForUpdate.bind(this));
    this.autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));
    this.autoUpdater.on('update-not-available', this.onUpdateNotAvailable.bind(this));
    this.autoUpdater.on('error', this.onError.bind(this));
    this.autoUpdater.on('download-progress', this.onDownloadProgress.bind(this));
    this.autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));
  }

  register() {
    this.autoUpdater.checkForUpdates();

    if (this.timer === null) {
      this.timer = setInterval(() => {
        if (!this.processing) {
          this.autoUpdater.checkForUpdates();
        }
      }, 1800000) // half-hour
    }
  }

  dialogOutdated(version) {
    return dialog.showMessageBox({
      type: 'info',
      title: 'Application is outdated',
      message: `The latest version released: ${version}`,
      detail: `The application updates the new version automatically and will apply when application restart.`,
      buttons: ['Release Notes', 'Close'],
      defaultId: 0,
    }, (idx) => {
      if (idx === 0) {
        shell.openExternal('https://github.com/policypalnet/pal-wallet/releases') }
    });
  }

  dialogRequiredUpdated() {
    return dialog.showMessageBox({
      type: 'info',
      title: 'New version',
      message: `The latest version is available`,
      detail: `The latest version is available, please restart to apply the change.`,
      buttons: ['Restart'],
      defaultId: 0,
    }, () => this.autoUpdater.quitAndInstall());
  }

  onCheckingForUpdate() {
    this.processing = true;
  }

  onUpdateAvailable(info) {
    this.autoUpdater.downloadUpdate();
    this.dialogOutdated(info.version);
  }

  onUpdateNotAvailable() {
    this.processing = false;
  }

  onError() {
    this.processing = false;
  }

  onDownloadProgress() {
    this.processing = true;
  }

  onUpdateDownloaded() {
    this.dialogRequiredUpdated();
  }
}
