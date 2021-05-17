import _ from 'lodash';
import { Intent, Position, Toaster } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const DefaultToaster = Toaster.create({
  position: Position.TOP,
});

export const sendErrorToast = (options = {}, onlySelf = false) => {
  const opt = {
    intent: Intent.DANGER,
    timeout: 3000,
    message: '网络服务异常，请稍后再试',
    icon: IconNames.ERROR,
  };
  sendToast({ ...opt, ...options }, onlySelf);
};

export const sendWarningToast = (options = {}, onlySelf = false) => {
  const opt = {
    intent: Intent.WARNING,
    timeout: 3000,
    message: '',
    icon: IconNames.WARNING_SIGN,
  };
  sendToast({ ...opt, ...options }, onlySelf);
};

export const sendSuccessToast = (options = {}, onlySelf = false) => {
  const opt = {
    intent: Intent.SUCCESS,
    timeout: 3000,
    message: '',
    icon: IconNames.TICK,
  };
  sendToast({ ...opt, ...options }, onlySelf);
};

export const sendPrimaryToast = (options = {}, onlySelf = false) => {
  const opt = {
    intent: Intent.PRIMARY,
    timeout: 3000,
    message: '',
  };
  sendToast({ ...opt, ...options }, onlySelf);
};

let isOnlySelf = false;
const sendToast = (toast, onlySelf = false) => {
  if (_.find(DefaultToaster.getToasts(), toast) === undefined) {
    if (onlySelf) {
      const { timeout } = toast;
      isOnlySelf = true;
      setTimeout(() => (isOnlySelf = false), timeout);
      return DefaultToaster.show(toast);
    }

    if (!isOnlySelf) {
      return DefaultToaster.show(toast);
    }
  }
};

export const clearToast = () => {
  return DefaultToaster.clear();
};
