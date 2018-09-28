/*
PackageSender.js
===================
Sign packages and send them to gateway
*/
import PkgSenderWorker from './packageSender.worker';

// Constructor
function PackageSender(setPkg) {
    if (process.env.NODE_ENV === 'production') {
        this.worker = new PkgSenderWorker();
    } else {
        this.worker = new Worker('./components/Miner/PackageSenderWorker/packageSender.worker.js');
    }

    // Function to update package status in UI
    this.setPkg = setPkg;
};

// Start worker
PackageSender.prototype.startWorker = function(snAddress, snPKey, setSnStats) {
  let startTime = new Date();

  if (this.worker) {
    // Start work with SN privatekey and gateway IP
    this.worker.postMessage({
      cmd: 'Start',
      snPKey,
      gatewayIP: process.env.PPN_GATEWAY_IP,
    });

    // Set package status
    this.worker.onmessage = (e) => {
      try {
        const endTime = new Date();
        const timeForPkg = (endTime - startTime) / 1000;

        if (setSnStats) {
          setSnStats(snAddress, timeForPkg, e.data.txs.length);
        }
      } catch (error) {
        console.log('Parsing pkg info failed!');
      }

      this.setPkg({
        ...e.data,
        snAddress,
      });
      startTime = new Date();
    }
  }
};

// Stop worker
PackageSender.prototype.stopWorker = function() {
  if (this.worker) {
    this.worker.postMessage({cmd: 'Stop'});
  }
}

// Package to sign and send to gateway
PackageSender.prototype.sendPackage = function(pkg) {
  // If package is not empty, send it
  if (this.worker && pkg && pkg.dag && pkg.dag.length > 0) {
    this.worker.postMessage({
      cmd: 'Send_Package',
      pkg,
    });
  }
};

// Stop the transaction worker
PackageSender.prototype.updateJwt = function(jwt) {
  if (this.worker) {
    this.worker.postMessage({
      cmd: 'Update_Jwt',
      jwt,
    });
  }
}

export default PackageSender;
