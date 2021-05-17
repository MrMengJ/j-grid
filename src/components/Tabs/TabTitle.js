import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Title16 from '../Title/Title16';
import { getPrimaryColor } from '../../utils/style';

const Title = styled(Title16)`
  display: inline-block;
  font-weight: 500;
  padding: 18px 0 16px 0;
  margin-right: 30px;
  &:last-child {
    margin-right: 0;
  }
  cursor: pointer;
  color: ${(props) => (props.selected ? getPrimaryColor(props.theme) : '')};
  transition: all 0.3s ease-in-out;
  border-bottom: 2px solid transparent;
  &:hover {
    color: ${(props) => getPrimaryColor(props.theme)};
    border-color: ${(props) => getPrimaryColor(props.theme)};
  }
  &:focus {
    outline: none;
  }
`;

export class TabTitle extends Component {
  handleClick = (e) => this.props.onClick(this.props.id, e);

  render() {
    const { theme, disabled, id, selected, title, children, style } = this.props;
    return (
      <Title
        style={style}
        theme={theme}
        selected={selected}
        data-tab-id={id}
        onClick={disabled ? undefined : this.handleClick}
        tabIndex={disabled ? undefined : 0}
      >
        {title}
        {children}
      </Title>
    );
  }
}

TabTitle.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  title: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  theme: PropTypes.string,
};

TabTitle.defaultProps = {
  onClick: () => {},
  selected: false,
  title: null,
  className: '',
  style: {},
};
