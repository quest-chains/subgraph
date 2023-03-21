import { BigInt, TypedMap } from '@graphprotocol/graph-ts';
import { QuestChain, Quest, QuestStatus } from '../../types/schema';

function questChainCompletedByUser(
  chainId: string,
  questCount: i32,
  questerId: string,
): boolean {
  if (questCount == 0) return false;

  let atLeastOnePassed = false;

  for (let questIdx: i32 = 0; questIdx < questCount; questIdx = questIdx + 1) {
    let questId = chainId
      .concat('-')
      .concat(BigInt.fromI32(questIdx).toHexString());
    let quest = Quest.load(questId);
    if (quest == null) return false;

    let questStatusId = questId.concat('-').concat(questerId);
    let questStatus = QuestStatus.load(questStatusId);
    if (
      !(quest.optional || quest.paused) &&
      (questStatus == null || questStatus.status != 'pass')
    )
      return false;

    if (questStatus != null && questStatus.status == 'pass')
      atLeastOnePassed = true;
  }

  return atLeastOnePassed;
}

export function updateQuestChainCompletions(
  questChain: QuestChain,
): QuestChain {
  let completed = new TypedMap<string, boolean>();

  for (let i = 0; i < questChain.questers.length; ++i) {
    let questerId = questChain.questers[i];

    let hasCompleted = questChainCompletedByUser(
      questChain.id,
      questChain.totalQuestCount,
      questerId,
    );

    completed.set(questerId, hasCompleted);
  }

  let completedQuesters = new Array<string>();

  for (let i = 0; i < completed.entries.length; ++i) {
    if (completed.entries[i].value) {
      let questerId = completed.entries[i].key;
      completedQuesters.push(questerId);
    }
  }

  questChain.completedQuesters = completedQuesters;
  questChain.numCompletedQuesters = completedQuesters.length;

  return questChain;
}
