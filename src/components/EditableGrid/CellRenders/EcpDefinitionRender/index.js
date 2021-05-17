import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get, isEmpty } from 'lodash';

import { getCellAlignCssValue } from '../../helper';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: ${(props) => getCellAlignCssValue(props.align)};
  height: 100%;
  padding: 0 8px;
`;

const Item = styled.div`
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

class EcpDefinitionRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  refresh(params) {
    const { value } = params;
    this.setState({ value });

    // return true to tell the grid we refreshed successfully
    return true;
  }

  render() {
    const { align } = this.props;
    const value = get(this.state.value, 'value');
    return isEmpty(value) ? null : (
      <Wrapper align={align}>
        <Item>{get(value, 'processName', '')}</Item>
        <Item>
          ({get(value, 'ownerAccount', '')} {get(value, 'ownerName', '')})
        </Item>
      </Wrapper>
    );
  }
}

EcpDefinitionRender.propTypes = {
  value: PropTypes.any,
};

EcpDefinitionRender.defaultProps = {};

export default EcpDefinitionRender;
