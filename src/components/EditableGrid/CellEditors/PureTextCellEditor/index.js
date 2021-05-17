import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { get } from 'lodash';

import TextArea from '../../../TextArea';

const StyledTextArea = styled(TextArea)`
  width: 100% !important;
  height: 100% !important;
  padding: 0 10px !important;
  line-height: 1.5 !important;
  &:focus {
    box-shadow: none !important;
  }
`;

class PureTextCellEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.inputRef.current) {
        this.inputRef.current.select();
      }
    });
  }

  getValue() {
    return this.state.value;
  }

  handleChange = (e) => {
    this.setState({
      value: { ...this.state.value, value: e.target.value },
    });
  };

  render() {
    return (
      <StyledTextArea
        inputRef={this.inputRef}
        value={get(this.state.value, 'value', '')}
        onChange={this.handleChange}
      />
    );
  }
}

PureTextCellEditor.propTypes = {
  value: PropTypes.object,
};

PureTextCellEditor.defaultProps = {};

export default PureTextCellEditor;
