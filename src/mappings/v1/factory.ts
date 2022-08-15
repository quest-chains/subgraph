import { log } from '@graphprotocol/graph-ts';

import {
  QuestChainCreated as QuestChainCreatedEvent,
  FactoryInit as FactoryInitEvent,
  AdminReplaced as AdminReplacedEvent,
  ImplReplaced as ImplReplacedEvent,
  TreasuryReplaced as TreasuryReplacedEvent,
  PaymentTokenReplaced as PaymentTokenReplacedEvent,
  UpgradeFeeReplaced as UpgradeFeeReplacedEvent,
  QuestChainUpgraded as QuestChainUpgradedEvent,
  QuestChainFactoryV1 as QuestChainFactory,
} from '../../types/QuestChainFactoryV1/QuestChainFactoryV1';
import {
  QuestChainV1 as QuestChainTemplate,
  QuestChainTokenV1 as QuestChainTokenTemplate,
} from '../../types/templates';

import { getUser, getGlobal, getQuestChain } from '../helpers';

export function handleFactoryInit(event: FactoryInitEvent): void {
  let globalNode = getGlobal();
  globalNode.factoryAddress = event.address;
  let contract = QuestChainFactory.bind(event.address);
  globalNode.implAddress = contract.questChainImpl();
  let tokenAddress = contract.questChainToken();
  globalNode.tokenAddress = tokenAddress;
  globalNode.adminAddress = contract.admin();
  globalNode.treasuryAddress = contract.treasury();
  globalNode.paymentTokenAddress = contract.paymentToken();
  globalNode.upgradeFee = contract.upgradeFee();

  QuestChainTokenTemplate.create(tokenAddress);
  globalNode.save();
}

export function handleAdminReplaced(event: AdminReplacedEvent): void {
  let globalNode = getGlobal();
  globalNode.adminAddress = event.params.admin;
  globalNode.save();
}

export function handleImplReplaced(event: ImplReplacedEvent): void {
  let globalNode = getGlobal();
  globalNode.implAddress = event.params.impl;
  globalNode.save();
}

export function handleTreasuryReplaced(event: TreasuryReplacedEvent): void {
  let globalNode = getGlobal();
  globalNode.treasuryAddress = event.params.treasury;
  globalNode.save();
}

export function handlePaymentTokenReplaced(
  event: PaymentTokenReplacedEvent,
): void {
  let globalNode = getGlobal();
  globalNode.paymentTokenAddress = event.params.paymentToken;
  globalNode.save();
}

export function handleUpgradeFeeReplaced(event: UpgradeFeeReplacedEvent): void {
  let globalNode = getGlobal();
  globalNode.upgradeFee = event.params.upgradeFee;
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
  questChain.creationTxHash = event.transaction.hash;

  questChain.version = '1';
  questChain.premium = false;

  QuestChainTemplate.create(event.params.questChain);

  user.save();
  questChain.save();
}

export function handleQuestChainUpgraded(event: QuestChainUpgradedEvent): void {
  let questChain = getQuestChain(event.params.questChain);

  log.info('handleQuestChainUpgraded {}', [
    event.params.questChain.toHexString(),
  ]);

  questChain.version = '1';
  questChain.premium = true;

  questChain.save();
}
