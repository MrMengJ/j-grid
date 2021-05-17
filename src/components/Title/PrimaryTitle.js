import React from 'react';
import styled from 'styled-components';

const Title = styled.h1`
  height: 32px;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
`;

const PrimaryTitle = ({ className, text }) => <Title className={className}>{text}</Title>;

export default PrimaryTitle;
