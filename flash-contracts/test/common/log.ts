import { Result } from '@ethersproject/abi';
import { expect } from 'chai';
import { BaseContract, ContractReceipt, ContractTransaction } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';

type ExpectLogParams = {
  contract: BaseContract;
  tx: ContractTransaction;
  receipt: ContractReceipt;
  name: string;
  index?: number;
  check: (data: Result) => void;
}

export const expectLog = ({
  contract,
  tx,
  receipt,
  name,
  index = 0,
  check,
}: ExpectLogParams) => {
  expect(tx).to.emit(contract, name);

  const eventSignature = Object.keys(contract.interface.events).find((event) => event.startsWith(name));
  expect(eventSignature).to.be.not.equal(undefined);
  const eventSignatureTopic = keccak256(toUtf8Bytes(eventSignature!));

  let foundLogIndex = 0;
  const eventLog = receipt.logs.find((log) => {
    if (log.topics[0] === eventSignatureTopic) {
      if (foundLogIndex === index) {
        return log;
      }
      foundLogIndex++;
    }
    return undefined;
  });
  expect(eventLog).to.be.not.equal(undefined);

  const data = contract.interface.decodeEventLog(name, eventLog!.data, eventLog!.topics);
  check(data);
};
