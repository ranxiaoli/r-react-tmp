/*
 * @Author: raoyibo 00415
 * @Date: 2020-04-20 14:18:30
 * @Description: Description
 */
const CSS_PREFIX = 'hz';

const STATICS = {
  // 单行高
  ROW_HEIGHT: 32.5,
  // 搜索框设置
  SEARCHER_HEIGHT: {
    small: 24,
    default: 32,
    large: 40,
  },
  // 树形可视区域
  VIEW_HEIGHT: 325,
  // rowkey变treeKey的分割符
  TREE_KEY_SPLIT: '^',
  // Tree虚拟根节点key值
  TREE_VIRTUAL_ROOT: 'WYP',
  // 搜索字符限制
  SEARCH_CHAR_LIMIT: 1,
  // 滚动条样式
  scrollBarSetting: {
    width: '6px',
    height: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  }
};

const DEFAULT_PROPS = {
  dataSetting: {
    dataKey: 'id',
    viewKey: 'name',
    childArrayKey: 'children',
  },
  data: [],
  autoExpandParent: false,
  searchSetting: {
    placeholder: '搜索设备',
    size: 'default',
    disabled: false,
  },
  scrollBarSetting: {},
};

/**
 * 判断是否有子元素
 * @param {dataSetting} dataSetting
 */
const hasChild = dataSetting => treeNode => {
  const { hasChild, childArrayKey } = dataSetting;

  // 判空
  let defaultJugdge = !!treeNode[childArrayKey];
  // 判断数组长度是否为0
  if (Array.isArray(treeNode[childArrayKey]) && treeNode[childArrayKey].length === 0) {
    defaultJugdge = false;
  }

  return hasChild ? hasChild(treeNode) : defaultJugdge;
};

/**
 * 判断是否禁用checkbox
 * @param {treeNodeRender} treeNodeRender
 */
const isDisableCheckbox = treeNodeRender => treeNode => {
  if (!treeNodeRender) {
    return false;
  }

  return treeNodeRender(treeNode).disableCheckbox || false;
};

/**
 * 是否应用disabledKeys
 * @param {*} treeNodeRender
 */
const isDisabledKeysApply = treeNodeRender => {
  if (!treeNodeRender) {
    return true;
  }

  const fnStr = treeNodeRender.toString();
  return !(fnStr.includes('disableCheckbox') || fnStr.includes('disabled'));
};

export { STATICS, CSS_PREFIX, DEFAULT_PROPS, hasChild, isDisableCheckbox, isDisabledKeysApply };
