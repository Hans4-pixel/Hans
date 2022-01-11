import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import inspect from 'browser-util-inspect';
import { forAddress } from '@truffle/decoder';
import { useSelector } from 'react-redux';
import * as Codec from '@truffle/codec';
import Spinner from '../../ui/spinner';
import ErrorMessage from '../../ui/error-message';
import fetchWithCache from '../../../helpers/utils/fetch-with-cache';
import { getSelectedAccount, getCurrentChainId } from '../../../selectors';
import { hexToDecimal } from '../../../helpers/utils/conversions.util';
import { I18nContext } from '../../../contexts/i18n';
import { toChecksumHexAddress } from '../../../../shared/modules/hexstring-utils';
import Tooltip from '../../ui/tooltip/tooltip';
import {
  transformTxDecoding,
  parameterProcessing,
} from './transaction-decoding.util';
import {
  FETCH_PROJECT_INFO_URI,
  FETCH_SUPPORTED_NETWORKS_URI,
} from './constants';

import Address from './components/decoding/address';
import CopyRawData from './components/ui/copy-raw-data';
import Accreditation from './components/ui/accreditation';

export default function TransactionDecoding({ to = '', inputData: data = '' }) {
  const t = useContext(I18nContext);
  const [tx, setTx] = useState([]);
  const [sourceAddress, setSourceAddress] = useState('');
  const [sourceFetchedVia, setSourceFetchedVia] = useState('');

  const { address: from } = useSelector(getSelectedAccount);
  const network = hexToDecimal(useSelector(getCurrentChainId));

  const [loading, setLoading] = useState(false);
  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [processedValues, setProcessedValues] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const networks = await fetchWithCache(FETCH_SUPPORTED_NETWORKS_URI, {
          method: 'GET',
        });

        if (
          !networks.some(
            (n) => n.active && Number(n.chainId) === Number(network),
          )
        ) {
          throw new Error(
            t('transactionDecodingUnsupportedNetworkError', [network]),
          );
        }

        const requestUrl = `${FETCH_PROJECT_INFO_URI}?${new URLSearchParams({
          to,
          'network-id': network,
        })}`;

        const response = await fetchWithCache(requestUrl, { method: 'GET' });

        const { info: projectInfo, fetchedVia, address } = response;

        // update source information
        if (address) {
          setSourceAddress(address);
        }

        if (fetchedVia) {
          setSourceFetchedVia(fetchedVia);
        }

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

        // transform tx decoding arguments into tree data
        const params = transformTxDecoding(decoding?.arguments);

        setTx(params);

        const dict = await parameterProcessing(params);

        setProcessedValues(dict);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(true);
        if (error?.message.match('400')) {
          setErrorMessage(t('txInsightsNotSupported'));
        } else {
          setErrorMessage(error?.message);
        }
      }
    })();
  }, [t, from, to, network, data]);

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
              <Tooltip
                title={[value.asBN || value.asString].toString()}
                interactive="true"
                position="top"
                arrow
              >
                <span className="sol-item solidity-uint">
                  {[
                    processedValues[name] ||
                      value.asBN.toString() ||
                      value.asString.toString(),
                  ]}
                </span>
              </Tooltip>
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
                  {value.map((itemValue, index) => {
                    return (
                      <li key={`${itemValue.type?.typeClass}-${index}`}>
                        {renderLeaf({
                          typeClass: itemValue.type?.typeClass,
                          value: itemValue.value,
                          kind: itemValue.kind,
                        })}
                      </li>
                    );
                  })}
                </ol>
              </details>
            );

          case 'address': {
            const address = value?.asAddress;
            return (
              <Address
                addressOnly
                checksummedRecipientAddress={toChecksumHexAddress(address)}
              />
            );
          }
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
      <li key={`${typeClass}-${index}`}>
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
    if (loading) {
      return (
        <div className="tx-insight-loading">
          <Spinner color="#F7C06C" />
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="tx-insight-error">
          <ErrorMessage errorMessage={errorMessage} />
        </div>
      );
    }

    return (
      <div className="tx-insight-content">
        <div className="tx-insight-content__tree-component">
          <ol>{tx.map(renderTree)}</ol>
        </div>
        <div className="tx-insight-content__copy-raw-tx">
          <CopyRawData data={data} />
        </div>
        {sourceFetchedVia && sourceAddress ? (
          <div className="tx-insight-content__accreditation">
            <Accreditation
              address={sourceAddress}
              fetchVia={sourceFetchedVia}
            />
          </div>
        ) : null}
      </div>
    );
  };

  return <div className="tx-insight">{renderTransactionDecoding()}</div>;
}

TransactionDecoding.propTypes = {
  to: PropTypes.string.isRequired,
  inputData: PropTypes.string.isRequired,
};
