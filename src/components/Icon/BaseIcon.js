import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isElement } from 'react-is';
import { isArray, isNull, map, min } from 'lodash';

const Svg = styled.svg`
  transition: fill 0.2s ease-in-out;
  fill: ${(props) => props.color};
`;

const SIZE_STANDARD = 16;
const SIZE_LARGE = 20;

const renderIcon = (iconPath) => {
  if (isArray(iconPath)) {
    return map(iconPath, (path, index) => {
      const element = renderPath(path);
      return React.cloneElement(element, { key: index });
    });
  }
  return renderPath(iconPath);
};

const renderPath = (path) => {
  return <path d={path} />;
};

function BaseIcon({
  className,
  icon,
  size,
  color,
  viewBox,
  hoverColor,
  createDefs,
  onClick,
  maximumSize,
  width,
}) {
  if (isElement(icon)) {
    return <>{icon}</>;
  }

  const pixelGridSize =
    size < SIZE_LARGE ? SIZE_STANDARD : min([SIZE_LARGE, maximumSize]);

  return (
    <Svg
      color={color}
      hoverColor={hoverColor}
      width={width ? width : size}
      height={size}
      viewBox={viewBox ? viewBox : `0 0 ${pixelGridSize} ${pixelGridSize}`}
      className={className}
      onClick={onClick}
    >
      {!isNull(createDefs) && <defs>{createDefs()}</defs>}
      {renderIcon(icon)}
    </Svg>
  );
}

BaseIcon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  size: PropTypes.number,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  viewBox: PropTypes.string,
  createDefs: PropTypes.func,
  onClick: PropTypes.func,
  maximumSize: PropTypes.number,
  width: PropTypes.number,
};

BaseIcon.defaultProps = {
  className: '',
  icon: '',
  size: SIZE_STANDARD,
  color: '#999',
  createDefs: null,
  onClick: null,
  maximumSize: SIZE_LARGE,
  width: null,
};

export default BaseIcon;
