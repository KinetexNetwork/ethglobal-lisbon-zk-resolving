import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getDeployContractData } from '../../utils/deploy';
import { beginTask } from '../../utils/format';
import { operation } from '../../utils/operation';

type Args = {
  collateralToken: string;
  proofVerifier: string;
  dry: boolean;
  nonce?: string;
};

export const flashDeploy = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  await operation({
    title: 'Deploy KinetexFlash',
    env,
    mode: args.dry ? 'dry-run' : 'run',
    transaction: async () => {
      const data = await getDeployContractData({
        contractName: 'KinetexFlash',
        constructorParams: [
          args.collateralToken,
          args.proofVerifier,
        ],
        env,
      });
      return { data };
    },
    nonce: args.nonce,
  });
};
