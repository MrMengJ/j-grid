import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isElement } from 'react-is';

import Icon from '../../../../../components/Icon';
import { getPrimaryColor, getRGBA } from '../../../../../utils/style';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: ${(props) =>
      getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.1)};
    color: ${(props) => getPrimaryColor(props.theme.PRIMARY_COLOR)};
    svg {
      fill: ${(props) => getPrimaryColor(props.theme.PRIMARY_COLOR)};
    }
  }
`;

const Text = styled.span`
  margin-left: 6px;
  font-size: 14px;
  transition: color 0.2s ease-in-out;
`;

class IconBtn extends Component {
  renderIcon = () => {
    const { icon, iconProps } = this.props;
    if (!icon) {
      return null;
    }
    return <> {isElement(icon) ? { icon } : <Icon icon={icon} {...iconProps} />} </>;
  };

  render() {
    const { className, style, text } = this.props;
    return (
      <Wrapper className={className} style={style}>
        {this.renderIcon()}
        <Text>{text}</Text>
      </Wrapper>
    );
  }
}

IconBtn.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  text: PropTypes.string,
};

IconBtn.defaultProps = {
  className: '',
  style: {},
  text: '',
};

export default IconBtn;
