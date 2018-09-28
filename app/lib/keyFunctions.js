import Wallet from 'ethereumjs-wallet';


const options = {
  kdf: "pbkdf2",
};

/**
 * Generate filename for a keystore file.
 * @param {string} address Ethereum address.
 * @return {string} Keystore filename.
 */
const generateKeystoreFilename = (address) => {
  let filename = `UTC--${new Date().toISOString()}--${address}`;

  // Windows does not permit ":" in filenames, replace all with "-"
  if (process.platform === "win32") filename = filename.split(":").join("-");

  return filename;
}

const generateKeyStore = (password) => {
  try {
    const wallet = Wallet.generate();
    const keyStore = JSON.parse(wallet.toV3String(password, options));

    return keyStore;
  } catch (error) {
    console.log(`Keystore creation error: ${error.message}`);
  }

  return null;
}

const keyStoreToPKey = (keyStore, password) => {
  if (!password) {
    return {
      error: 'Password invalid.'
    };
  }

  if (!keyStore) {
    return {
      error: 'Keystore invalid.'
    };
  }

  try {
    const wallet = Wallet.fromV3(keyStore.toString(), password, true);
    return {
      privateKey: `0x${wallet.getPrivateKey().toString('hex')}`,
    };
  } catch (error) {
    return ({
      error: 'Password authentication failed.',
    })
  }
}

const pKeyToKeyStore = async (password, pKey, useScrypt = false) => {
  if (!password) {
    return {
      error: 'Password invalid.'
    };
  }

  if (!pKey) {
    return {
      error: 'Private Key invalid.'
    };
  }

  try {
    const key = Buffer.from(pKey.slice(2), 'hex');
    const wallet = await new Promise(resolve => resolve(Wallet.fromPrivateKey(key)));
    return { keyStore: JSON.parse(wallet.toV3String(password, useScrypt ? null : options)) };
  } catch (error) {
    return {
      error: 'Keystore creation failed.'
    };
  }
}

export {
  generateKeystoreFilename,
  generateKeyStore,
  pKeyToKeyStore,
  keyStoreToPKey,
};
