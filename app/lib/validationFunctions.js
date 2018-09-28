// Validations
const regexPrivateKey = /^(0x)?[0-9a-f]{64}$/;
const regexName = /^[a-zA-Z0-9\d\-_.,\s]+$/;

// eslint-disable-next-line import/prefer-default-export
export const validator = (key, value) => {
  let result = '';

  switch (key) {
    case 'name': {
      if (value.length > 0 && !regexName.test(value)) {
        result = 'Wallet name only accept a-z A-Z and 0-9.';
      }
      break;
    }
    case 'privateKey': {
      if (value.length > 0 && !regexPrivateKey.test(value.toLowerCase())) {
        result = `The private key too long or too short, should be 66 characters include 0x at start.`;
      }
      break;
    }
    case 'password': {
      if (value.length < 9) {
        result = 'Your password must be at least 9 characters.';
      }
      break;
    }
    default: {
      break;
    }
  }

  return result;
};
