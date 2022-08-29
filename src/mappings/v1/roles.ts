import { Bytes, Address } from '@graphprotocol/graph-ts';
import { QuestChainV1 as QuestChainContract } from '../../types/templates/QuestChainV1/QuestChainV1';

export function getRoles(address: Address): Bytes[] {
  let chain = QuestChainContract.bind(address);
  let try_DEFAULT_ADMIN_ROLE = chain.try_DEFAULT_ADMIN_ROLE();
  let try_ADMIN_ROLE = chain.try_ADMIN_ROLE();
  let try_EDITOR_ROLE = chain.try_EDITOR_ROLE();
  let try_REVIEWER_ROLE = chain.try_REVIEWER_ROLE();
  return [
    try_DEFAULT_ADMIN_ROLE.reverted
      ? Bytes.fromI32(0)
      : try_DEFAULT_ADMIN_ROLE.value,
    try_ADMIN_ROLE.reverted ? Bytes.fromI32(0) : try_ADMIN_ROLE.value,
    try_EDITOR_ROLE.reverted ? Bytes.fromI32(0) : try_EDITOR_ROLE.value,
    try_REVIEWER_ROLE.reverted ? Bytes.fromI32(0) : try_REVIEWER_ROLE.value,
  ];
}
