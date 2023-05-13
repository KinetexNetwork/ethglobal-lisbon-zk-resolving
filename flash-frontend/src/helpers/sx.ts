import { SxProps } from '@mui/material';
import { SystemStyleObject } from '@mui/system';

import { Nullish, isNull } from 'helpers/null';

type SxArrayItem<Theme extends object> =
  | boolean
  | SystemStyleObject<Theme>
  | ((theme: Theme) => SystemStyleObject<Theme>);

type SxPropsOrItem<Theme extends object> = SxProps<Theme> | SxArrayItem<Theme>;

const isSxArray = <Theme extends object>(sx: SxPropsOrItem<Theme>): sx is readonly SxArrayItem<Theme>[] => {
  return Array.isArray(sx);
};

/**
 * Combine multiple sx values into one sx
 */
export const csx = <Theme extends object>(...sxs: Nullish<SxPropsOrItem<Theme>>[]): SxProps<Theme> => {
  const combined: SxArrayItem<Theme>[] = [];
  for (const sx of sxs) {
    if (isNull(sx)) {
      continue;
    }
    if (isSxArray(sx)) {
      combined.push(...sx);
    } else {
      combined.push(sx);
    }
  }
  return combined;
};
