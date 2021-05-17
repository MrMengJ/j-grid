import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Popover, Position } from '@blueprintjs/core';
import {
  cloneDeep,
  filter,
  find,
  findIndex,
  isEmpty,
  isFunction,
  map,
  noop,
} from 'lodash';

import useOnClickOutside from '../../hooks/useOnClickOutside';
import { getPrimaryColor, getRGBA } from '../../utils/style';
import { KEY_CODES } from '../../constants/event';
import { off, on } from '../../utils/dom';
import useDeepCompareEffect from '../../hooks/useDeepCompareEffect';

import RightElement from './RightElement';
import Options from './Options';
import MultipleSelect from './MultipleSelect';
import SingleSelect from './SingleSelect';
import { delayHandler, getOptions } from './helper';

import './advancedSelect.css';

const Wrapper = styled.div`
  & input {
    cursor: pointer;
    font-size: 16px;
    @media screen and (max-width: 1930px) {
      font-size: 14px;
      height: 30px;
    }
  }
  &:hover {
    input {
      box-shadow: ${(props) =>
        props.disabled
          ? 'none'
          : `0 0 0 1px ${(props) => getPrimaryColor(props.theme.PRIMARY_COLOR)};
        0 0 0 3px ${(props) => getRGBA(getPrimaryColor(props.theme.PRIMARY_COLOR), 0.3)},
        inset 0 1px 1px ${(props) => getRGBA(props.theme.BLACK, 0.2)}`};
    }
  }
  .bp3-popover-wrapper {
    width: 100%;
    .bp3-popover-target {
      width: 100%;
    }
  }
`;

const Content = styled.div`
  min-width: ${(props) => (props.width ? `${props.width}px` : `140px`)};
  width: ${(props) => (props.width ? `${props.width}px` : '')};
`;

function AdvancedSelect(props) {
  const {
    defaultValue,
    noDataText,
    noMatchText,
    disabled,
    width,
    className,
    style,
    placeholder,
    multiple,
    clearable,
    filterOption,
    minTagCount,
    children,
    onChange,
    onChangeEnd,
    isNotNull,
    alignCenter,
    maxHeight,
    displayValueLength,
    isShowName,
    valueType,
    selectRef,
    usePortal,
    boundary,
    defaultIsOpen,
  } = props;
  const [value, setValue] = useState(props.value ? props.value : defaultValue);
  const [isOpenOptions, setIsOpenOptions] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const containerRef = useRef(null);
  const optionsRef = useRef(null);

  useOnClickOutside([containerRef, optionsRef], () => {
    setIsOpenOptions(false);
  });

  useDeepCompareEffect(() => {
    if (props.value) {
      setValue(props.value);
    } else if (props.defaultValue) {
      setValue(props.defaultValue);
    }
  }, [props.value, props.defaultValue]);

  useEffect(() => {
    const handler = (event) => {
      if (event.keyCode === KEY_CODES.ESCAPE && isOpenOptions) {
        setIsOpenOptions(false);
      }
    };

    on(document, 'keydown', handler);
    return () => {
      off(document, 'keydown', handler);
    };
  }, [isOpenOptions]);

  useEffect(() => {
    if (defaultIsOpen) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.click();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMultipleSelectValue = (value) => {
    if (isEmpty(value) || !value) {
      return [];
    }
    const optionProps = map(getOptions(children), (item) => item.props);
    return filter(
      map(value, (item) => {
        return find(optionProps, (optionProp) => {
          return optionProp.value === item;
        });
      }),
      (item) => !!item
    );
  };

  const getOptionsValue = (value) => {
    if (!value) {
      return [];
    }
    return value;
  };

  const handleClick = () => {
    if (disabled) {
      return;
    }
    setIsOpenOptions(!isOpenOptions);
  };

  const handleChange = (newValue) => {
    let value = newValue;
    if (isNotNull && isEmpty(newValue)) {
      value = defaultValue;
    }
    setValue(value);
    onChange(value);
    delayHandler(() => onChangeEnd(value), 1000);
  };

  const handleClearAll = () => {
    if (multiple) {
      handleChange(value.slice(0, minTagCount));
    } else {
      handleChange([]);
    }
  };

  const handleRemove = (val, event) => {
    // avoid drop down panel close
    event.stopPropagation();

    if (value.length <= minTagCount) {
      return;
    }

    const index = findIndex(value, (item) => item === val);
    if (index >= 0) {
      let newValue = cloneDeep(value);
      newValue.splice(index, 1);
      if (isNotNull && isEmpty(newValue)) {
        newValue = defaultValue;
      }
      handleChange(newValue);
    }
  };

  const handleSingleSelectBlur = () => {
    setInputValue('');
  };

  const handleSingleSelectChange = (value) => {
    if (!isOpenOptions) {
      setIsOpenOptions(true);
    }
    setInputValue(value);
  };

  const handleMultipleSelectChange = (value) => {
    if (!isOpenOptions) {
      setIsOpenOptions(true);
    }
    setInputValue(value);
  };

  const setRef = (node) => {
    containerRef.current = node;
    if (isFunction(selectRef)) {
      selectRef(node);
    }
  };

  return (
    <Wrapper
      className={className}
      style={style}
      disabled={disabled}
      ref={setRef}
      onClick={handleClick}
    >
      <Popover
        portalClassName={'select-list-overlay'}
        popoverClassName={'select-list-popover'}
        position={Position.BOTTOM}
        isOpen={isOpenOptions}
        usePortal={usePortal}
        boundary={boundary}
        modifiers={{
          arrow: {
            enabled: false,
          },
        }}
        content={
          <Options
            ref={optionsRef}
            value={getOptionsValue(value)}
            inputValue={inputValue}
            containerRef={containerRef}
            options={getOptions(children, filterOption, inputValue)}
            noDataText={inputValue ? noMatchText : noDataText}
            multiple={multiple}
            minTagCount={minTagCount}
            onChange={handleChange}
          />
        }
      >
        <Content width={width}>
          {!multiple && (
            <SingleSelect
              alignCenter={alignCenter}
              filterOption={filterOption}
              placeholder={placeholder}
              disabled={disabled}
              value={value}
              options={children}
              onBlur={handleSingleSelectBlur}
              onChange={handleSingleSelectChange}
              rightElement={
                disabled ? null : (
                  <RightElement
                    isOpenOptions={isOpenOptions}
                    clearable={clearable}
                    containerRef={containerRef}
                    onClearAll={handleClearAll}
                  />
                )
              }
            />
          )}
          {multiple && (
            <MultipleSelect
              filterOption={filterOption}
              disabled={disabled}
              value={getMultipleSelectValue(value)}
              maxHeight={maxHeight}
              placeholder={placeholder}
              onRemove={handleRemove}
              onChange={handleMultipleSelectChange}
              displayValueLength={displayValueLength}
              isShowName={isShowName}
              valueType={valueType}
              rightElement={
                disabled ? null : (
                  <RightElement
                    isOpenOptions={isOpenOptions}
                    clearable={clearable}
                    containerRef={containerRef}
                    onClearAll={handleClearAll}
                  />
                )
              }
            />
          )}
        </Content>
      </Popover>
    </Wrapper>
  );
}

AdvancedSelect.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  defaultValue: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  filterOption: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  width: PropTypes.number,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  clearable: PropTypes.bool,
  placeholder: PropTypes.string,
  noDataText: PropTypes.string,
  noMatchText: PropTypes.string,
  minTagCount: PropTypes.number,
  onChange: PropTypes.func,
  isNotNull: PropTypes.bool,
  alignCenter: PropTypes.bool, // single select mode result text align center
  onChangeEnd: PropTypes.func,
  maxHeight: PropTypes.number,
  displayValueLength: PropTypes.bool,
  isShowName: PropTypes.bool,
  valueType: PropTypes.string,
  selectRef: PropTypes.func,
  usePortal: PropTypes.bool, // use portal
  boundary: PropTypes.string, // popover boundary
  defaultIsOpen: PropTypes.bool, // 默认是否展开
};

AdvancedSelect.defaultProps = {
  className: '',
  style: {},
  filterOption: false,
  disabled: false,
  multiple: false,
  clearable: false,
  isNotNull: false,
  placeholder: '请选择',
  noDataText: '无数据',
  noMatchText: '无匹配数据',
  minTagCount: 0,
  alignCenter: false,
  onChange: noop,
  onChangeEnd: noop,
  maxHeight: null,
  displayValueLength: false,
  isShowName: false,
  valueType: '',
  selectRef: noop,
  usePortal: true,
  boundary: 'scrollParent',
  defaultIsOpen: false,
};

export default AdvancedSelect;
