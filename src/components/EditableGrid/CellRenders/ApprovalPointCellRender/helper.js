import React from 'react';
import { filter, forEach, get, head, isEmpty, map, sortBy } from 'lodash';

import RenderApprovalPointIcon from './RenderApprovalPointIcon';

export const getNewContent = (
  data,
  disabled = false,
  isShowMethodsName = false,
  isDeleteStatus = false
) => {
  const methods = get(data, 'methods', []);
  const approvalOrder = get(data, 'approvalOrder', null);
  const approvalOrderBrackets = get(data, 'approvalOrderBrackets', false);
  const methodBrackets = get(data, 'methodBrackets', false);
  return (
    <RenderApprovalPointIcon
      approvalOrder={approvalOrder}
      approvalMethods={methods}
      approvalOrderBrackets={approvalOrderBrackets}
      methodBrackets={methodBrackets}
      isShowMethodsName={isShowMethodsName}
      disabled={disabled}
      isDeleteStatus={isDeleteStatus}
    />
  );
};

export const sortedValuesName = (values) => {
  return map(sortBy(values, 'sortId'), (item) => item.name).join('、');
};

export const getApprovalOrderMap = () => {
  const APPROVAL_ORDER_MAP_COUNT = 40;
  const ORDER_MAP = {};
  for (let i = 0; i <= APPROVAL_ORDER_MAP_COUNT; i++) {
    if (i === 0) {
      ORDER_MAP[i] = ``;
    } else {
      ORDER_MAP[i] = `${i}`;
    }
  }
  return ORDER_MAP;
};

export const APPROVAL_POINT_METHODS = JSON.parse(
  localStorage.getItem('APPROVAL_METHODS')
);

export const getMethodsWithBgColor = (methods) =>
  filter(methods, (item) => !isEmpty(item.bgColor));

export const getMethodIdsWithBgColor = (methods) =>
  map(getMethodsWithBgColor(methods), (item) => item.id);

export const getMethodBgColor = (methods) =>
  get(head(getMethodsWithBgColor(methods)), 'bgColor');

export const getMethodsImgIcon = () => {
  let result = {};
  forEach(APPROVAL_POINT_METHODS, (item) => {
    result[item.id] = item.imageIcon;
  });
  return result;
};
