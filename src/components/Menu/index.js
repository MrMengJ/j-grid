import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Menu as BpMenu } from '@blueprintjs/core';

function Menu({ children, ...otherProps }) {
  const ulRef = useRef(null);
  const [isShow, setIsShow] = useState(true);
  useEffect(() => {
    if (ulRef.current.childElementCount === 0) {
      setIsShow(false);
    }
  }, []);
  if (!isShow) {
    return null;
  }
  return (
    <BpMenu ulRef={ulRef} {...otherProps}>
      {children}
    </BpMenu>
  );
}

Menu.propTypes = {
  children: PropTypes.node,
};

export default Menu;
