import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  font-weight: 600;
`;

class GroupCellRender extends Component {
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
    return <Wrapper>{value}</Wrapper>;
  }
}

GroupCellRender.propTypes = {
  value: PropTypes.string,
};

export default GroupCellRender;
