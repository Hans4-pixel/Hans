import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Icon, IconName, IconSize } from '../../component-library';

const Disclosure = ({ children, title, size }) => {
  const disclosureFooterEl = useRef(null);
  const [open, setOpen] = useState(false);

  const scrollToBottom = () => {
    disclosureFooterEl &&
      disclosureFooterEl.current &&
      disclosureFooterEl.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [open]);

  return (
    <div className="disclosure" onClick={() => setOpen((state) => !state)}>
      {title ? (
        <details>
          <summary className="disclosure__summary">
            <Icon
              className="disclosure__summary--icon"
              name={IconName.Add}
              size={IconSize.Sm}
              marginInlineEnd={2}
            />
            {title}
          </summary>
          <div className={classnames('disclosure__content', size)}>
            {children}
          </div>
          <div ref={disclosureFooterEl} className="disclosure__footer"></div>
        </details>
      ) : (
        children
      )}
    </div>
  );
};

Disclosure.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  size: PropTypes.string,
};

Disclosure.defaultProps = {
  size: 'normal',
  title: null,
};

export default Disclosure;
