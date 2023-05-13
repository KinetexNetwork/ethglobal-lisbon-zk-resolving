import { FC } from 'react';

import { Text } from '../Text';

import { AllowancePermittedData, Permitted } from './Permitted';

export type { AllowancePermittedData };
export type AllowanceHelperData = 'loading' | 'needs-approve' | 'needs-permit' | AllowancePermittedData;

type Props = {
  data: AllowanceHelperData;
};

export const Allowance: FC<Props> = ({ data }) => {
  switch (data) {
    case 'loading':
      return <Text>Checking allowance...</Text>;
    case 'needs-approve':
      return <Text>Needs approve</Text>;
    case 'needs-permit':
      return <Text>Needs permit</Text>;
    default:
      return (
        <Text color='info.main'>
          <Permitted data={data} />
        </Text>
      );
  }
};
