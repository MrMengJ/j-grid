import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

const ModifiedStatusMark = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4185f3;
`;

class SelectorCellRender extends Component {
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
    const { value } = this.state;
    const { modified } = value;

    return <Wrapper>{modified && <ModifiedStatusMark />}</Wrapper>;
  }
}

SelectorCellRender.propTypes = {
  value: PropTypes.object.isRequired,
};

SelectorCellRender.defaultProps = {};

export default SelectorCellRender;
