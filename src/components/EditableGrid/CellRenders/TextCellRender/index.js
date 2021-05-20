import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get, isString } from 'lodash';

import { getCellAlignCssValue } from '../../helper';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => getCellAlignCssValue(props.align)};
  position: relative;
  height: 100%;
  padding: 0 8px;
  ${(props) => (props.keepWrapping ? `white-space: pre-wrap;` : '')}
`;

class TextCellRender extends Component {
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
    const { align, keepWrapping } = this.props;
    const { value } = this.state;
    const text = get(value, 'value', '');
    return (
      <Wrapper align={align} keepWrapping={keepWrapping}>
        {isString(text) ? text : ''}
      </Wrapper>
    );
  }
}

TextCellRender.propTypes = {
  value: PropTypes.any,
  keepWrapping: PropTypes.bool, // 文字是否保持换行
};

TextCellRender.defaultProps = {
  value: {},
  keepWrapping: false,
};

export default TextCellRender;
