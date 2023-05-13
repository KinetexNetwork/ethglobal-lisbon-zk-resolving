import { Nullish, isNotNull } from 'helpers/null';
import { getNowInMs, isoFromMs } from 'helpers/time';

export const logError = (error: Nullish<unknown>, title: string, description = ''): void => {
  console.error('~~~');
  console.error(`Time: ${isoFromMs(getNowInMs())}`);
  console.error(`Error: ${title}`);
  console.error(`Description: ${description || '---'}`);
  console.error('Source:', isNotNull(error) ? error : '---');
  console.error('~~~');
};

const makeDisplayError = (title: string, description: string): string => {
  let displayError = title;
  if (description) {
    displayError += `: ${description}`;
  }
  return displayError;
};

export const handleError = (error: unknown, title: string, description: string): string => {
  logError(error, title, description);
  return makeDisplayError(title, description);
};
