/**
 * 字符计算
 * @param {内容} str
 */
export function charCount(str) {
  return (str && str.replace(/[^\x20-\xff]/g, 'x').length) || 0;
}

/**
 * 统计字符在字符串中出现次数
 * @param {字符串} str
 * @param {字符} char
 */
export function countCharExist(str, char) {
  const re = new RegExp(char, 'g');
  return str.match(re) ? str.match(re).length : 0;
}

/**
 * differ
 * @param {数组} a
 * @param {数组} b
 */
export function differArray(a, b) {
  const arr = a.concat(b);
  const obj = new Map();
  const result = [];

  arr.forEach(i => {
    if (!obj.get(i)) {
      obj.set(i, 1);
    } else {
      obj.set(i, obj.get(i) + 1);
    }
  });

  Array.from(obj.keys()).forEach(i => {
    const value = obj.get(i);
    if (value === 1) {
      result.push(i);
    }
  });

  return result;
}

/**
 * 获取a过滤b后的值
 * @param {Array} a
 * @param {Array} b
 */
export function filterArray(a, b) {
  return a.filter(i => !b.includes(i));
}

/**
 * 10进制转化为20位2进制
 * @param {10进制数} tenNumber
 */
export function convertTenToBinary(tenNumber) {
  return `0000000000000000000${tenNumber.toString(2)}`.slice(-20);
}

export function throttle(func, delay) {
  let timer = null;
  let startTime = Date.now();
  return (...args) => {
    const curTime = Date.now();
    const remaining = delay - (curTime - startTime);
    const context = this;
    clearTimeout(timer);
    if (remaining <= 0) {
      func.apply(context, args);
      startTime = Date.now();
    } else {
      timer = setTimeout(() => func.apply(context, args), remaining);
    }
  };
}

/**
 * 生成随机字符串
 */
function S4() {
  return ((1 + Math.random()) * 0x10000 || 0).toString(16).substring(1);
}

export function guid() {
  return `${S4()} ${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
}
