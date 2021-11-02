import React from 'react';
import { ETHSignature } from '@keystonehq/bc-ur-registry-eth';
import * as uuid from 'uuid';
import PropTypes from 'prop-types';
import BaseReader from '../base-reader';
import { useI18nContext } from '../../../../hooks/useI18nContext';

const Reader = ({
  submitQRHardwareSignature,
  cancelQRHardwareSignRequest,
  requestId,
}) => {
  const t = useI18nContext();
  const cancel = () => {
    cancelQRHardwareSignRequest();
  };

  const handleSuccess = (ur) => {
    return new Promise((resolve, reject) => {
      if (ur.type === 'eth-signature') {
        const ethSignature = ETHSignature.fromCBOR(ur.cbor);
        const buffer = ethSignature.getRequestId();
        const signId = uuid.stringify(buffer);
        if (signId === requestId) {
          submitQRHardwareSignature(signId, ur.cbor.toString('hex'))
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error('#mismatched_signId'));
        }
      } else {
        reject(new Error(t('unknownQrCode')));
      }
    });
  };

  return <BaseReader handleCancel={cancel} handleSuccess={handleSuccess} />;
};

Reader.propTypes = {
  submitQRHardwareSignature: PropTypes.func.isRequired,
  cancelQRHardwareSignRequest: PropTypes.func.isRequired,
  requestId: PropTypes.string.isRequired,
};

export default Reader;
