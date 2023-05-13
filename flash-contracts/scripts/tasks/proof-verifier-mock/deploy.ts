import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getDeployContractData } from '../../utils/deploy';
import { beginTask } from '../../utils/format';
import { operation } from '../../utils/operation';

type Args = {
  dry: boolean;
  nonce?: string;
};

export const proofVerifierMockDeploy = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  await operation({
    title: 'Deploy ProofVerifierMock',
    env,
    mode: args.dry ? 'dry-run' : 'run',
    transaction: async () => {
      const data = await getDeployContractData({
        contractName: 'ProofVerifierMock',
        constructorParams: [],
        env,
      });
      return { data };
    },
    nonce: args.nonce,
  });
};
