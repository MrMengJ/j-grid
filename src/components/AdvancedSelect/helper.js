import { isArray, isFunction, forEach, filter, includes, toUpper, some } from 'lodash';

import Option from './Option';
import OptionGroup from './OptionGroup';

const isElementOfType = (element, ComponentType) => {
  return (
    element != null &&
    element.type != null &&
    element.type.displayName != null &&
    element.type.displayName === ComponentType.displayName
  );
};

const isOptionElement = (child) => {
  return isElementOfType(child, Option);
};

const isOptionGroupElement = (child) => {
  return isElementOfType(child, OptionGroup);
};

export const isGroupMode = (children) => {
  return some(children, isOptionGroupElement);
};

const getOptionModeOptions = (children, filterOption, inputValue) => {
  if (!filterOption || !inputValue) {
    return filter(children, isOptionElement);
  }
  if (isFunction(filterOption)) {
    return filter(children, (item) => {
      return isOptionElement(item) && filterOption(inputValue, item.props);
    });
  }
  return filter(children, (item) => {
    return (
      isOptionElement(item) && includes(toUpper(item.props.label), toUpper(inputValue))
    );
  });
};

const getGroupModeOptions = (children, filterOption, inputValue) => {
  if (!filterOption || !inputValue) {
    return filter(children, isOptionGroupElement);
  }
  const matchedGroup = filter(children, (item) => {
    const options = isArray(item.props.children)
      ? item.props.children
      : [item.props.children];

    return (
      isOptionGroupElement(item) &&
      some(options, (option) => {
        return filterOption(inputValue, option.props);
      })
    );
  });

  const matched = [];
  forEach(matchedGroup, (item, index) => {
    matched.push({ ...item, props: { ...item.props, children: [] } });
    const options = isArray(item.props.children)
      ? item.props.children
      : [item.props.children];
    forEach(options, (option) => {
      const isMatched = isFunction(filterOption)
        ? filterOption(inputValue, option.props)
        : includes(toUpper(option.label), toUpper(inputValue));
      if (isMatched) {
        matched[index].props.children.push(option);
      }
    });
  });

  return matched;
};

export const getOptions = (children, filterOption, inputValue) => {
  const result = isArray(children) ? children : [children];
  if (isGroupMode(result)) {
    return getGroupModeOptions(result, filterOption, inputValue);
  }
  return getOptionModeOptions(result, filterOption, inputValue);
};

let timer;
export const delayHandler = (handler, wait = 0) => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(handler, wait);
};
