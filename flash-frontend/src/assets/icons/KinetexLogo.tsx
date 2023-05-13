import { Ref, SVGProps, forwardRef } from 'react';

import { SvgIcon } from '@mui/material';

const Svg = forwardRef((props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    fill='none'
    viewBox='0 0 57 50'
    ref={ref}
    {...props}
  >
    <path d='M10.15 32.74c-5.64-.25-13.54-5.3-8.59-11.4 2.31-2.53 5.71-3.64 8.96-3.94a54.58 54.58 0 0 0-5.1 3.48c-6.7 5.17.27 8.8 4.73 11.86ZM37.32 15.5c5.28.12 10.8 1.07 15.31 4.04 4.79 3.24 4.62 8.25-.12 11.44-9.46 6.1-24.24 6.1-34.83 3.6 10.38.64 24.51 0 33.35-5.67 9.15-6.86-8.68-12.03-13.71-13.4Zm6.38 20.98c4.09 9-.77 17.88-10.6 11.16a29.4 29.4 0 0 1-8.41-9.62c2.1 1.9 4.15 3.77 6.33 5.41 9.75 7.24 12.7 4.48 12.7-6.95h-.03Z' />
    <path d='M15.11 21.52c-2.88-5-7.1-17.22-.61-20.93 3.8-1.77 7.83.8 10.76 3.01 8.26 6.92 13.78 16.55 16.76 26.73-4.53-9.05-10.12-18.38-18.29-24.76-6.19-4.7-10.76-4.3-10.48 4.45.25 3.88.9 7.73 1.94 11.47h-.1l.02.03ZM31.2 5.83C34.36.76 43.12-3.3 45.62 4.5c.87 3.4 0 6.92-1.32 9.97h-.1c.1-2.12.06-4.25-.13-6.37-.5-4.58-2.5-6.46-7.03-4.75-1.9.65-3.76 1.67-5.82 2.59l-.06-.08.02-.03Z' />
    <path d='M26.5 44c-5.81 7.11-15.32 8.67-15.23-3.05.71-11.22 7.57-22.86 15.42-30.6l.07.06c-6 8.57-12.28 20.08-12.92 30.61-.39 9.94 7.1 6.51 12.66 2.98Z' />
  </svg>
));
Svg.displayName = 'InnerSvg';
const Icon: any = forwardRef((props, ref: Ref<SVGSVGElement>) => (
  <SvgIcon
    {...props}
    ref={ref}
    component={Svg}
    inheritViewBox
  />
));
Icon.muiName = SvgIcon.muiName;
Icon.displayName = 'SvgKinetexLogo';
const WrappedIcon: typeof SvgIcon = Icon;
export default WrappedIcon;
