import { ethers } from 'hardhat';

export const nowSeconds = async (): Promise<number> => {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
};

export const minutesToSeconds = (minutes: number): number => {
  return minutes * 60;
};

export const hoursToMinutes = (hours: number): number => {
  return hours * 60;
}

export const hoursToSeconds = (hours: number): number => {
  return minutesToSeconds(hoursToMinutes(hours));
};
