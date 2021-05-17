import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Li = styled.li`
  position: relative;
  margin: 0;
  padding-top: 6px;
  clear: both;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Label = styled.div`
  color: #999;
  padding: 5px 10px;
  font-size: 16px;
`;

const List = styled.ul`
  padding: 0 4px 0 0;
  margin: 0;
  min-width: 100%;
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  cursor: pointer;
`;

class OptionGroup extends Component {
  render() {
    const { label, children } = this.props;
    return (
      <Li>
        <Label>{label}</Label>
        <List>{children}</List>
      </Li>
    );
  }
}

OptionGroup.displayName = 'OptionGroup';

OptionGroup.propTypes = {
  label: PropTypes.string,
};

OptionGroup.defaultProps = {
  label: '',
};

export default OptionGroup;
