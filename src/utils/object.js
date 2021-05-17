export function bound(obj1, obj2) {
  for (let pro in obj2) {
    if (typeof obj2[pro] === 'function') {
      obj1[pro] = obj2[pro].bind(obj1);
    }
  }
}
