import { task } from 'hardhat/config';

task('x-deployer', 'Prints active deployer account info')
  .setAction(async (args, env) => {
    const { deployerInfo } = await import('./deployer/info');
    await deployerInfo(args, env);
  });

task('x-flash-deploy', 'Deploys KinetexFlash')
  .addParam('collateralToken', 'Collateral token (ERC-20) address')
  .addParam('proofVerifier', 'ProofVerifier contract address')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { flashDeploy } = await import('./flash/deploy');
    await flashDeploy(args, env);
  });

task('x-flash-light-deploy', 'Deploys KinetexFlashLight')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { flashLightDeploy } = await import('./flash-light/deploy');
    await flashLightDeploy(args, env);
  });

task('x-proof-verifier-deploy', 'Deploys ProofVerifier')
  .addOptionalParam('chain', 'Chain IDs (comma-separated list)')
  .addOptionalParam('lightClient', 'LightClient contract addresses (comma-separated list)')
  .addOptionalParam('broadcaster', 'Broadcaster contract addresses (comma-separated list)')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { proofVerifierDeploy } = await import('./proof-verifier/deploy');
    await proofVerifierDeploy(args, env);
  });

task('x-proof-verifier-mock-deploy', 'Deploys ProofVerifierMock')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { proofVerifierMockDeploy } = await import('./proof-verifier-mock/deploy');
    await proofVerifierMockDeploy(args, env);
  });

task('x-proof-decode', 'Decodes proof bytes')
  .addParam('proof', 'Encoded proof data')
  .setAction(async (args, env) => {
    const { proofDecode } = await import('./proof/decode');
    await proofDecode(args, env);
  });
