import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Quest, QuestStatus } from '../../types/schema';

export function questChainCompletedByUser(
  chainAddress: Address,
  questCount: i32,
  userAddress: Address,
): boolean {
  if (questCount == 0) return false;

  let atLeastOnePassed = false;

  for (let questIdx: i32 = 0; questIdx < questCount; questIdx = questIdx + 1) {
    let questId = chainAddress
      .toHexString()
      .concat('-')
      .concat(BigInt.fromI32(questIdx).toHexString());
    let questStatusId = questId.concat('-').concat(userAddress.toHexString());
    let quest = Quest.load(questId);
    if (quest == null) return false;
    let questStatus = QuestStatus.load(questStatusId);
    if (questStatus == null) return false;

    if (!(quest.optional || quest.paused || questStatus.status == 'pass'))
      return false;

    if (!atLeastOnePassed && questStatus.status == 'pass')
      atLeastOnePassed = true;
  }

  return atLeastOnePassed;
}
