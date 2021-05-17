export const isIE = () => {
  return window.ActiveXObject || 'ActiveXObject' in window;
};
