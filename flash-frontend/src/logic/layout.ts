import { useWindowSize } from 'usehooks-ts';

export const useInWidth = (maxWidth: number): boolean => {
  const { width } = useWindowSize();
  return width < maxWidth;
};
