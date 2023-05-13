import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { beginTask, formatHexBytesSize } from '../../utils/format';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { logPropertyGroup } from '../../utils/property';

type Args = {
  proof: string;
};

export const proofDecode = async (
  args: Args,
  env: HardhatRuntimeEnvironment,
): Promise<void> => {
  beginTask();

  const decodedProof = defaultAbiCoder.decode(
    [
      'tuple(' +
        'uint64 srcSlot,' +
        'uint64 txSlot,' +
        'bytes32[] receiptsRootProof,' +
        'bytes32 receiptsRoot,' +
        'bytes[] receiptProof,' +
        'bytes txIndexRLPEncoded,' +
        'uint256 logIndex' +
      ')'
    ],
    args.proof,
  )[0];

  const srcSlot = decodedProof.srcSlot.toString();
  const txSlot = decodedProof.txSlot.toString();
  const receiptsRootProof = decodedProof.receiptsRootProof;
  const receiptsRoot = decodedProof.receiptsRoot;
  const receiptProof = decodedProof.receiptProof;
  const txIndexRLPEncoded = decodedProof.txIndexRLPEncoded;
  const logIndex = decodedProof.logIndex.toString();

  const proof = {
    srcSlot,
    txSlot,
    receiptsRootProof,
    receiptsRoot,
    receiptProof,
    txIndexRLPEncoded,
    logIndex,
  };

  logPropertyGroup({
    title: `Decoded ${formatHexBytesSize(args.proof)} proof`,
    properties: [
      { title: 'srcSlot', value: srcSlot },
      { title: 'txSlot', value: txSlot },
      { title: 'receiptsRootProof', value: JSON.stringify(receiptsRootProof) },
      { title: 'receiptsRoot', value: receiptsRoot },
      { title: 'receiptProof', value: JSON.stringify(receiptProof) },
      { title: 'txIndexRLPEncoded', value: txIndexRLPEncoded },
      { title: 'logIndex', value: logIndex },
      { title: 'as JSON', value: JSON.stringify(proof) },
    ],
  });
};
