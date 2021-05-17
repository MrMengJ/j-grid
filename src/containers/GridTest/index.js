import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import PrListGrid from './PrListGrid';

const Wrapper = styled.div`
  height: 100%;
`;

class GridTest extends Component {
  render() {
    return (
      <Wrapper>
        <PrListGrid currentTheme={'#4185f3'} />
      </Wrapper>
    );
  }
}

GridTest.propTypes = {
  currentTheme: PropTypes.string,
};

const mapStateToProps = () => {
  return (state) => ({});
};

export default connect(mapStateToProps)(GridTest);
