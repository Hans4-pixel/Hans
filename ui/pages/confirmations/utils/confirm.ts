import { ApprovalRequest } from '@metamask/approval-controller';
import { ApprovalType } from '@metamask/controller-utils';
import { TransactionType } from '@metamask/transaction-controller';
import { Json } from '@metamask/utils';

export const REDESIGN_APPROVAL_TYPES = [
  ApprovalType.PersonalSign,
  ApprovalType.EthSignTypedData,
] as const;

export const REDESIGN_TRANSACTION_TYPES = [
  TransactionType.contractInteraction,
] as const;

const SIGNATURE_APPROVAL_TYPES = [
  ApprovalType.EthSign,
  ApprovalType.PersonalSign,
  ApprovalType.EthSignTypedData,
];

export const isSignatureApprovalRequest = (
  request: ApprovalRequest<Record<string, Json>>,
) => SIGNATURE_APPROVAL_TYPES.includes(request.type as ApprovalType);
