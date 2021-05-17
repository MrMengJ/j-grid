import React, { Component } from 'react';
import { PopoverInteractionKind, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { includes, noop, omit, values } from 'lodash';

import { getPrimaryColor } from '../../utils/style';

import BaseIcon from './BaseIcon';
import BpIcon from './BpIcon';

import './icon.css';

const bpIconValues = values(IconNames);

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  &:focus {
    outline: none !important;
  }
  svg:hover {
    fill: ${(props) =>
      props.hoverColor
        ? `${props.hoverColor}`
        : props.hasDefaultHoverEffect
        ? `${getPrimaryColor(props.theme.PRIMARY_COLOR)}`
        : `${props.color}`};
  }
`;

class Icon extends Component {
  renderIcon = () => {
    const { icon, hoverColor, className, style, hasDefaultHoverEffect, ...otherProps } =
      this.props;
    const otherIconProps = omit(otherProps, 'tooltipProps');
    const isBpIcon = includes(bpIconValues, icon);
    return (
      <IconWrapper
        className={className}
        style={style}
        hasDefaultHoverEffect={hasDefaultHoverEffect}
      >
        {isBpIcon ? (
          <BpIcon icon={icon} hoverColor={hoverColor} {...otherIconProps} />
        ) : (
          <BaseIcon icon={icon} hoverColor={hoverColor} {...otherIconProps} />
        )}
      </IconWrapper>
    );
  };

  render() {
    const {
      tooltipProps: { content, position, boundary },
    } = this.props;
    return (
      <>
        {content ? (
          <Tooltip
            content={content}
            popoverClassName={'epros-prlist-button-tooltip'}
            position={position}
            boundary={boundary}
          >
            {this.renderIcon()}
          </Tooltip>
        ) : (
          this.renderIcon()
        )}
      </>
    );
  }
}

Icon.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  size: PropTypes.number,
  color: PropTypes.string,
  hasDefaultHoverEffect: PropTypes.bool,
  hoverColor: PropTypes.string,
  createDefs: PropTypes.func,
  onClick: PropTypes.func,
  maximumSize: PropTypes.number,
  viewBox: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  tooltipProps: PropTypes.shape({
    content: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    interactionKind: PropTypes.oneOf([
      PopoverInteractionKind.HOVER,
      PopoverInteractionKind.HOVER_TARGET_ONLY,
    ]),
    position: PropTypes.string,
  }),
};

Icon.defaultProps = {
  className: '',
  style: {},
  icon: '',
  size: 16,
  color: '#999',
  onClick: noop,
  tooltipProps: {},
  hasDefaultHoverEffect: false,
};

export default Icon;
