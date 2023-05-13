import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import { formatGasUnitsSummary } from '../../scripts/utils/format';

type TransactionInfo = {
  tx: ContractTransaction,
  receipt: ContractReceipt,
  gas: BigNumber,
}

export const printGasInfo = (target: string, gasUsed: BigNumber): void => {
  console.log(`Gas used to ${target}: ${formatGasUnitsSummary(gasUsed)}`);
};

export const gasInfo = async (
  target: string,
  tx: ContractTransaction,
): Promise<TransactionInfo> => {
  const info = await gasInfoCore(tx);
  printGasInfo(target, info.receipt.gasUsed);
  return info;
};

export const gasInfoSilent = async (
  tx: ContractTransaction,
): Promise<TransactionInfo> => {
  return await gasInfoCore(tx);
};

const gasInfoCore = async (
  tx: ContractTransaction,
): Promise<TransactionInfo> => {
  const receipt = await tx.wait();
  const gas = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  return { tx, receipt, gas };
};
