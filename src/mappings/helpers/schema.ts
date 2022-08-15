import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { User, Global, QuestChain, Quest } from '../../types/schema';
import { getNetwork } from './network';
import { ADDRESS_ZERO } from './constants';
import { createSearchString } from './strings';
import { fetchMetadata } from './ipfs';

export function getUser(address: Address): User {
  let user = User.load(address.toHexString());
  if (user == null) {
    user = new User(address.toHexString());
    user.questsPassed = new Array<string>();
    user.questsFailed = new Array<string>();
    user.questsInReview = new Array<string>();
  }
  return user as User;
}

export function getGlobal(): Global {
  let network = getNetwork();
  let globalNode = Global.load(network);
  if (globalNode == null) {
    globalNode = new Global(network);
    globalNode.factoryAddress = ADDRESS_ZERO;
    globalNode.implAddress = ADDRESS_ZERO;
    globalNode.tokenAddress = ADDRESS_ZERO;
    globalNode.adminAddress = ADDRESS_ZERO;
    globalNode.treasuryAddress = ADDRESS_ZERO;
    globalNode.paymentTokenAddress = ADDRESS_ZERO;
    globalNode.upgradeFee = BigInt.fromI32(0);
  }

  return globalNode as Global;
}

export function getQuestChain(address: Address): QuestChain {
  let questChain = QuestChain.load(address.toHexString());
  if (questChain == null) {
    let network = getNetwork();

    let questChain = new QuestChain(address.toHexString());

    questChain.address = address;
    questChain.chainId = network;

    questChain.numCompletedQuesters = 0;
    questChain.completedQuesters = new Array<string>();
    questChain.numQuesters = 0;
    questChain.questers = new Array<string>();

    questChain.questCount = 0;
    questChain.paused = false;

    questChain.owners = new Array<string>();
    questChain.admins = new Array<string>();
    questChain.editors = new Array<string>();
    questChain.reviewers = new Array<string>();

    questChain.questsPassed = new Array<string>();
    questChain.questsFailed = new Array<string>();
    questChain.questsInReview = new Array<string>();
  }
  return questChain as QuestChain;
}

export function createQuest(
  address: Address,
  questIndex: BigInt,
  details: string,
  creator: Address,
  event: ethereum.Event,
): Quest {
  let quest = getQuest(address, questIndex);

  let metadata = fetchMetadata(details);
  quest.details = details;
  quest.name = metadata.name;
  quest.description = metadata.description;
  quest.imageUrl = metadata.imageUrl;
  quest.externalUrl = metadata.externalUrl;
  quest.creationTxHash = event.transaction.hash;

  let search = createSearchString(metadata.name, metadata.description);
  quest.search = search;

  let user = getUser(creator);
  quest.createdAt = event.block.timestamp;
  quest.updatedAt = event.block.timestamp;
  quest.createdBy = user.id;
  user.save();

  return quest;
}

export function getQuest(address: Address, questIndex: BigInt): Quest {
  let questId = address
    .toHexString()
    .concat('-')
    .concat(questIndex.toHexString());
  let quest = Quest.load(questId);
  if (quest == null) {
    let quest = new Quest(questId);

    quest.questChain = address.toHexString();
    quest.questId = questIndex;
    quest.paused = false;

    quest.numCompletedQuesters = 0;
    quest.completedQuesters = new Array<string>();
    quest.numQuesters = 0;
    quest.questers = new Array<string>();

    quest.usersPassed = new Array<string>();
    quest.usersFailed = new Array<string>();
    quest.usersInReview = new Array<string>();
  }
  return quest as Quest;
}
