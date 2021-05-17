import { find, forEach, includes, isArray, keys } from 'lodash';

const getErrorKeys = (errors) => {
  const result = [];
  forEach(errors, (error, key) => {
    if (isArray(error)) {
      forEach(error, (item, index) => {
        const fieldName = keys(item)[0];
        if (item) {
          result.push(`${key}[${index}].${fieldName}`);
        }
      });
    } else {
      result.push(key);
    }
  });

  return result;
};

export const jumpToErrorField = ({
  isValid,
  isSubmitting,
  errors,
  baseElement = document.body,
  setFieldTouched,
}) => {
  if (isValid || !isSubmitting) {
    return;
  }
  const errorKeys = getErrorKeys(errors);
  forEach(errorKeys, (item) => setFieldTouched(item));
  const fieldElements = baseElement.querySelectorAll('[data-field]');
  const firstErrorElement = find(fieldElements, (element) => {
    return includes(errorKeys, element.getAttribute('data-field'));
  });
  if (firstErrorElement) {
    firstErrorElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
};
