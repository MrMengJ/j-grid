import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { find, head, isEmpty, map, noop } from 'lodash';

import InputGroup from '../Input/InputGroup';

import { getOptions } from './helper';

const StyledInputGroup = styled(InputGroup)`
  input {
    text-align: ${(props) => (props.aligncenter === 'true' ? 'center' : 'inherit')};
    white-space: nowrap;
    text-overflow: ellipsis;
    border-radius: 6px;
  }
  .bp3-input:disabled {
    color: #999999 !important;
    background-color: ${(props) =>
      props.readOnly || props.disabled ? '#eeeeee' : ''}!important;
    box-shadow: ${(props) => (props.readOnly || props.disabled ? 'none' : '')}!important;
  }
`;

function SingleSelect(props) {
  const {
    filterOption,
    disabled,
    alignCenter,
    rightElement,
    options,
    onFocus,
    onBlur,
    onChange,
  } = props;
  const [isFocus, setIsFocus] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const optionProps = map(getOptions(options), (item) => item.props);

  const handleFocus = (event) => {
    setIsFocus(true);
    onFocus(event);
  };

  const handleBlur = (event) => {
    setIsFocus(false);
    setInputValue('');
    onBlur(event);
  };

  const handleChange = (event) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    onChange(inputValue);
  };

  const getPlaceholder = (isFocus, { value, placeholder } = props) => {
    if (isFocus) {
      const result = find(optionProps, (item) => {
        return item.value === head(value);
      });
      return result ? (result.label ? result.label : result.value) : '';
    }
    return placeholder;
  };

  const getValue = (isFocus, inputValue, { value, filterOption } = props) => {
    if (isFocus && filterOption) {
      return inputValue;
    }

    if (isEmpty(value) || !value) {
      return '';
    }
    const result = find(optionProps, (item) => {
      return item.value === head(value);
    });
    return result ? (result.label ? result.label : result.value) : '';
  };

  return (
    <StyledInputGroup
      aligncenter={alignCenter.toString()}
      readOnly={!filterOption}
      placeholder={getPlaceholder(isFocus)}
      disabled={disabled}
      value={getValue(isFocus, inputValue)}
      rightElement={rightElement}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
}

SingleSelect.propTypes = {
  value: PropTypes.array,
  filterOption: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  disabled: PropTypes.bool,
  rightElement: PropTypes.element,
  options: PropTypes.arrayOf(PropTypes.element),
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  alignCenter: PropTypes.bool, // result text align center
};

SingleSelect.defaultProps = {
  value: [],
  filterOption: false,
  disabled: false,
  onFocus: noop,
  onBlur: noop,
  onChange: noop,
};

export default SingleSelect;
