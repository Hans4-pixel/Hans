import ConfirmPage from '../../confirm'
import {
  ARG_TYPES_SIGNATURE,
  CONFIRM_PAGE_DECORATOR,
  SignatureStoryTemplate
} from './utils';
import { unapprovedTypedSignMsgV1 } from '../../../../../../test/data/confirmations/typed_sign';

/**
 * The `<ConfirmPage>` that's displayed when the current confirmation is a version "V1" `eth_signTypedData` signature.
 */
export default {
  title: 'Pages/Confirmation/ConfirmPage/Signatures/SignTypedDataV1',
  component: ConfirmPage,
  decorators: CONFIRM_PAGE_DECORATOR,
  argTypes: ARG_TYPES_SIGNATURE,
  args: {
    msgParams: { ...unapprovedTypedSignMsgV1.msgParams },
  },
};

export const DefaultStory = (args) => {
  return SignatureStoryTemplate(args, unapprovedTypedSignMsgV1);
}
DefaultStory.storyName = 'Default';