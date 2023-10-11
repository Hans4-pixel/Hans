import React, { useContext, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Spinner from '../../ui/spinner';
import ErrorMessage from '../../ui/error-message';
import fetchWithCache from '../../../helpers/utils/fetch-with-cache';
import { useSelector } from 'react-redux';
import * as Codec from '@truffle/codec';
import { forAddress } from '@truffle/decoder';
import inspect from 'browser-util-inspect';
import { getSelectedAccount, getCurrentChainId } from '../../../selectors';
import { FETCH_PROJECT_INFO_URI, TX_EXTRA_URI } from './constants';
import { hexToDecimal } from '../../../helpers/utils/conversions.util';
import { I18nContext } from '../../../contexts/i18n';
import { transformTxDecoding } from './transaction-decoding.util';
import { toChecksumHexAddress } from '../../../../shared/modules/hexstring-utils';

import Address from './components/decoding/address';
import CopyRawData from './components/ui/copy-raw-data/';

export default function TransactionDecoding({ to = '', inputData: data = '' }) {
  const t = useContext(I18nContext);
  const [tx, setTx] = useState([]);
  const { address: from } = useSelector(getSelectedAccount);
  const chainId = hexToDecimal(useSelector(getCurrentChainId));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const request_url =
          FETCH_PROJECT_INFO_URI +
          '?' +
          new URLSearchParams({
            to,
            ['network-id']: chainId,
          });

        const response = await fetchWithCache(request_url, { method: 'GET' });

        if (!response) {
          throw new Error(`Decoding error: request time out !`);
        }

        if (!response.info) {
          throw new Error(`Decoding error: ${response}`);
        }

        const { info: projectInfo } = response;

        // creating instance of the truffle decoder
        const decoder = await forAddress(to, {
          provider: global.ethereumProvider,
          projectInfo,
        });

        // decode tx input data
        const decoding = await decoder.decodeTransaction({
          from,
          to,
          input: data,
          blockNumber: null,
        });

        // fake await
        await new Promise((resolve) => {
          setTimeout(() => resolve(true), 500);
        });

        // transform tx decoding arguments into tree data
        const params = transformTxDecoding(decoding?.arguments);
        setTx(params);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(true);
        setErrorMessage(error?.message);
      }
    })();
  }, [to, chainId, data]);

  // ***********************************************************
  // component rendering methods
  // ***********************************************************
  const renderLeaf = ({ name, kind, typeClass, value }) => {
    switch (kind) {
      case 'error':
        return (
          <span className="sol-item solidity-error">
            <span>Malformed data</span>
          </span>
        );

      default:
        switch (typeClass) {
          case 'int':
            return (
              <span className="sol-item solidity-int">
                {[value.asBN || value.asString].toString()}
              </span>
            );

          case 'uint':
            return (
              <span className="sol-item solidity-uint">
                {[value.asBN || value.asString].toString()}
              </span>
            );

          case 'bytes':
            return (
              <span className="sol-item solidity-bytes">{value.asHex}</span>
            );

          case 'array':
            return (
              <details>
                <summary className="typography--color-black">{name}: </summary>
                <ol>
                  {value.map((itemValue) => {
                    return (
                      <li>
                        {renderLeaf({
                          typeClass: itemValue.type.typeClass,
                          value: itemValue.value,
                          kind: itemValue.kind,
                        })}
                      </li>
                    );
                  })}
                </ol>
              </details>
            );

          case 'address':
            const address = value?.asAddress;
            return (
              <Address
                addressOnly={true}
                checksummedRecipientAddress={toChecksumHexAddress(address)}
              />
            );

          default:
            return (
              <pre className="sol-item solidity-raw">
                {inspect(new Codec.Format.Utils.Inspect.ResultInspector(value))}
              </pre>
            );
        }
    }
  };

  const renderTree = (
    { name, kind, typeClass, type, value, children },
    index,
  ) => {
    return children ? (
      <li>
        <details open={index === 0 ? 'open' : ''}>
          <summary>{name}: </summary>
          <ol>{children.map(renderTree)}</ol>
        </details>
      </li>
    ) : (
      <li className="solidity-value">
        <div className="solidity-named-item solidity-item">
          {typeClass !== 'array' && !Array.isArray(value) ? (
            <span className="param-name typography--color-black">{name}: </span>
          ) : null}
          <span className="sol-item solidity-uint">
            {renderLeaf({ name, typeClass, type, value, kind })}
          </span>
        </div>
      </li>
    );
  };

  const renderTransactionDecoding = () => {
    return loading ? (
      <div className="tx-insight-loading">
        <Spinner color="#F7C06C" />
      </div>
    ) : error ? (
      <div className="tx-insight-error">
        <ErrorMessage errorMessage={errorMessage} />
      </div>
    ) : (
      <div className="tx-insight-content">
        <div className="tx-insight-content__tree-component">
          <ol>{tx.map(renderTree)}</ol>
        </div>
        <div className="tx-insight-content__copy-raw-tx">
          <CopyRawData data={data} />
        </div>
      </div>
    );
  };

  return <div className="tx-insight">{renderTransactionDecoding()}</div>;
}

TransactionDecoding.propTypes = {
  to: PropTypes.string.isRequired,
  inputData: PropTypes.string.isRequired,
};
