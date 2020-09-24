import {
  TRANSACTION_CATEGORY_TOKEN_METHOD_APPROVE,
  TRANSACTION_CATEGORY_TOKEN_METHOD_TRANSFER,
  TRANSACTION_CATEGORY_TOKEN_METHOD_TRANSFER_FROM,
  TRANSACTION_STATUS_APPROVED,
  TRANSACTION_STATUS_CONFIRMED,
  TRANSACTION_STATUS_SUBMITTED,
  TRANSACTION_STATUS_UNAPPROVED,
} from '../../../../shared/constants/transaction'

export const PENDING_STATUS_HASH = {
  [TRANSACTION_STATUS_UNAPPROVED]: true,
  [TRANSACTION_STATUS_APPROVED]: true,
  [TRANSACTION_STATUS_SUBMITTED]: true,
}

export const PRIORITY_STATUS_HASH = {
  ...PENDING_STATUS_HASH,
  [TRANSACTION_STATUS_CONFIRMED]: true,
}

export const TOKEN_CATEGORY_HASH = {
  [TRANSACTION_CATEGORY_TOKEN_METHOD_APPROVE]: true,
  [TRANSACTION_CATEGORY_TOKEN_METHOD_TRANSFER]: true,
  [TRANSACTION_CATEGORY_TOKEN_METHOD_TRANSFER_FROM]: true,
}
