import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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

class TextAreaCellEditor extends Component {
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
      value: e.target.value,
    });
  };

  render() {
    return (
      <StyledTextArea
        inputRef={this.inputRef}
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}

TextAreaCellEditor.propTypes = {
  value: PropTypes.string,
};

TextAreaCellEditor.defaultProps = {};

export default TextAreaCellEditor;
