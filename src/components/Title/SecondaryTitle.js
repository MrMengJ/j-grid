import React from 'react';
import styled from 'styled-components';

const Title = styled.h2`
  height: 28px;
  margin: 0;
  max-width: 385px;
  font-size: 20px;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  letter-spacing: 1px;
`;

const SecondaryTitle = ({ className, text }) => (
  <Title title={text} className={className}>
    {text}
  </Title>
);

export default SecondaryTitle;
