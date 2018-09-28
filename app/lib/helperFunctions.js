const zeroString = '000000000000000000';

export const truncateHash = (hash) => {
  try {
    return `${hash.slice(0, 6)}...${hash.slice(hash.length - 5)}`;
  } catch (error) {
    console.log('Hash truncate failed!');
    return hash;
  }
};

export const weiToPalString = (weiString) => {
  try {
    const upper = weiString.length > 18 ? weiString.slice(0, weiString.length - 18) : '0';
    const lower = weiString.length > 18 ? weiString.slice(weiString.length - 18) : (`${zeroString.slice(0, 18 - weiString.length)}${weiString}`);

    let uppResult = '';
    let counter = 1;
    for (let i = upper.length - 1; i >= 0; i--) {
      const comma = i > 0 &&
                    counter % 3 === 0 ? ',' : '';
      uppResult = `${comma}${upper[i]}${uppResult}`
      counter += 1;
    }

    if (uppResult === '') {
      uppResult = '0';
    }

    if (uppResult === '') {
      uppResult = '0';
    }

    let lowerResult = '';
    for (let i = lower.length - 1; i >= 0; i--) {
      if (lower[i] !== '0' || i === 0) {
        lowerResult = `${lower[i]}${lowerResult}`
      }
    }

    return `${uppResult}.${lowerResult}`;
  } catch (error) {
    console.log('Wei String to Pal string failed!');
    return weiString;
  }
};

export const historyPush = (history, url) => {
  try {
    if (history.location.pathname !== url) {
      history.push(url);
    }
  } catch (error) {
    console.log('History push failed!');
  }
};

export const copyToClipboard = (text) => {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.opacity = '0';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}
