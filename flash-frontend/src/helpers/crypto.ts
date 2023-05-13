import CoinIcon from 'assets/svgIcons/Coin.svg';

export const cryptoIcon = (maybeCryptoIcon?: string): string => {
  if (!maybeCryptoIcon) {
    return CoinIcon;
  }

  // We assign the '_' suffix for icons whose upload failed and thus the content is just an empty image
  if (maybeCryptoIcon.startsWith('https://qs3') && maybeCryptoIcon.endsWith('_')) {
    return CoinIcon;
  }

  return maybeCryptoIcon;
};
