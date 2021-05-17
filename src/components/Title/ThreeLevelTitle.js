import React from 'react';
import styled from 'styled-components';

const Title = styled.h3`
  height: 22px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
`;

const ThreeLevelTitle = ({ className, text }) => (
  <Title className={className}>{text}</Title>
);

export default ThreeLevelTitle;
