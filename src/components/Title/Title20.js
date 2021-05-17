import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Text = styled.div`
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 26px;
  @media screen and (max-width: 1930px) {
    font-size: 20px;
  }
`;

function Title20({ className, children, ...otherProps }) {
  return (
    <Text className={className} {...otherProps}>
      {children}
    </Text>
  );
}

Title20.propTypes = {
  className: PropTypes.string,
};

export default Title20;
