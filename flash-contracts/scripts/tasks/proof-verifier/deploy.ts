import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getDeployContractData } from '../../utils/deploy';
import { beginTask } from '../../utils/format';
import { operation } from '../../utils/operation';
import { ProofChainConfigStruct } from '../../../typechain-types/contracts/proof/ProofVerifier';

type Args = {
  chain?: string;
  lightClient?: string;
  broadcaster?: string;
  dry: boolean;
  nonce?: string;
};

export const proofVerifierDeploy = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  const chains = args.chain?.split(',') ?? [];
  const lightClients = args.lightClient?.split(',') ?? [];
  const broadcasters = args.broadcaster?.split(',') ?? [];

  const totalConfigs = chains.length;
  if (lightClients.length !== totalConfigs || broadcasters.length !== totalConfigs) {
    throw new Error(
      `Equal number of proof chain config arguments expected, got: ` +
      `${chains.length} chains, ` +
      `${lightClients.length} light clients, ` +
      `${broadcasters.length} broadcasters`
    );
  }

  const proofChainConfigs: ProofChainConfigStruct[] = [];
  for (let i = 0; i < totalConfigs; i++) {
    const config: ProofChainConfigStruct = {
      chain: chains[i],
      lightClient: lightClients[i],
      broadcaster: broadcasters[i],
    };
    proofChainConfigs.push(config);
  }

  await operation({
    title: 'Deploy ProofVerifier',
    env,
    mode: args.dry ? 'dry-run' : 'run',
    transaction: async () => {
      const data = await getDeployContractData({
        contractName: 'ProofVerifier',
        constructorParams: [proofChainConfigs],
        env,
      });
      return { data };
    },
    nonce: args.nonce,
  });
};
