import { log } from '@graphprotocol/graph-ts';

import {
  QuestChainCreated as QuestChainCreatedEvent,
  QuestChainImplUpdated as QuestChainImplUpdatedEvent,
  QuestChainFactoryV0 as QuestChainFactory,
} from '../../types/QuestChainFactoryV0/QuestChainFactoryV0';
import {
  QuestChainV0 as QuestChainTemplate,
  QuestChainTokenV0 as QuestChainTokenTemplate,
} from '../../types/templates';

import { getUser, ADDRESS_ZERO, getGlobal, getQuestChain } from '../helpers';

export function handleQuestChainImplUpdated(
  event: QuestChainImplUpdatedEvent,
): void {
  let globalNode = getGlobal();
  if (globalNode.factoryAddress === ADDRESS_ZERO) {
    globalNode.factoryAddress = event.address;
    let contract = QuestChainFactory.bind(event.address);
    let tokenAddress = contract.questChainToken();
    let adminAddress = contract.owner();
    globalNode.adminAddress = adminAddress;
    globalNode.tokenAddress = tokenAddress;

    QuestChainTokenTemplate.create(tokenAddress);
  }

  globalNode.templateAddress = event.params.newImpl;
  globalNode.save();
}

export function handleQuestChainCreated(event: QuestChainCreatedEvent): void {
  let questChain = getQuestChain(event.params.questChain);

  log.info('handleQuestChainCreated {}', [
    event.params.questChain.toHexString(),
  ]);

  let user = getUser(event.transaction.from);

  questChain.factoryAddress = event.address;
  questChain.createdAt = event.block.timestamp;
  questChain.updatedAt = event.block.timestamp;
  questChain.createdBy = user.id;
  questChain.creationTxHash = event.transaction.hash;

  questChain.version = '0';
  questChain.premium = true; // all v0 quest chains are premium by default

  QuestChainTemplate.create(event.params.questChain);

  let globalNode = getGlobal();
  globalNode.questChainCount = globalNode.questChainCount + 1;
  globalNode.save();

  user.save();
  questChain.save();
}
