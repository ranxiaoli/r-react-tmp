import { STATICS } from '../constant';
import { convertTenToBinary } from './utils';

// 虚拟树，变量t指代tree
export default class VirtualizeTree {
  tDataSetting = {
    // 行key
    rowKey: '',
    // 下级属性名称
    childKey: '',
    // 数据展示文本键值
    viewKey: '',
    // 是否存在下级内容的判断
    hasChild: () => false,
    // 是否禁用
    isDisabled: () => false,
    // 根节点
    rootKey: STATICS.TREE_VIRTUAL_ROOT,
    // treeKey 含的分割符
    treeKeySplit: STATICS.TREE_KEY_SPLIT,
    // 行key类型
    rowKeyType: 'string',
  };

  tViewSetting = {
    // 树可见高度
    clientHeight: STATICS.VIEW_HEIGHT,
    // 行高
    rowHeight: STATICS.ROW_HEIGHT,
  };

  outerData = {
    // 数据渲染需要scrollTop的距离
    viewScrollTop: 0,
    // 虚拟树可视行数
    virtualHeight: 1,
  };

  innerData = {
    // 禁用rowKeys, 不参与父子联动
    disabledRowKeys: new Set(),
    // 记录rowKey: {item}
    rowKeyItemMap: new Map(),
    // 记录treeKey: Set(subs treeKey), 用于check计算
    treeKeySubsMap: new Map(),
    // 记录treeKey: Set(direct subs treeKey)
    treeKeyDirectSubsMap: new Map(),
    // 展开的keys toString
    expandedTreeKeysStr: '',
    // 树行rowKey Array
    treeRowKeys: [],
    // 可见行rowKey Array
    viewRowKeys: [],
  };

  constructor() {
    if (!VirtualizeTree.prototype.instanceSize) {
      VirtualizeTree.prototype.instanceSize = 1;
    } else {
      VirtualizeTree.prototype.instanceSize += 1;
      this.tDataSetting.rootKey = `${this.tDataSetting.rootKey}${VirtualizeTree.prototype.instanceSize}`;
    }
  }

  /**
   * 初始化对象属性
   * @param {string} rowKey 数据主键  eg: 'id'
   * @param {string} childKey 下级数据键值  eg: 'child'
   * @param {string} viewKey 搜索字段
   * @param {(item) => boolean} hasChild 是否存在下级的函数 (item) => boolean
   * @param {(item) => boolean} isDisabled 是否禁掉当前节点 (item) => boolean
   * @return {void}
   */
  initTree = (rowKey, childKey, viewKey, hasChild = () => false, isDisabled = () => false) => {
    this.tDataSetting.rowKey = rowKey;
    this.tDataSetting.childKey = childKey;
    this.tDataSetting.viewKey = viewKey;
    this.tDataSetting.hasChild = hasChild;
    this.tDataSetting.isDisabled = isDisabled;
  };

  /**
   * 修改视图设置
   * @param {number} clientHeight 可视区域高度 px
   * @return {void}
   */
  resizeTree = (clientHeight = STATICS.VIEW_HEIGHT) => {
    this.tViewSetting.clientHeight = clientHeight;
  };

  /**
   * 清空缓存对象
   * @return {void}
   */
  clearCache = () => {
    this.outerData = {
      viewScrollTop: 0,
      virtualHeight: 1,
    };

    this.innerData = {
      disabledRowKeys: new Set(),
      rowKeyItemMap: new Map(),
      treeKeySubsMap: new Map(),
      treeKeyDirectSubsMap: new Map(),
      expandedTreeKeysStr: '',
      treeRowKeys: [],
      viewRowKeys: [],
    };
  };

  /**
   * 注册数据
   * @param {Array<{ [key:string]: any }>} nodes 数据
   * @return {void}
   */
  initData = nodes => {
    this.clearCache();
    // 更新rowKeyType
    if (nodes[0]) {
      this.tDataSetting.rowKeyType = typeof nodes[0][this.tDataSetting.rowKey];
    }
    nodes.forEach((i, index) => {
      this.markData(i, index + 1);
    });
  };

  /**
   * 更新禁用keys
   */
  setDisabledKeys = (keys = []) => {
    if (!Array.isArray(keys)) {
      return;
    }

    this.innerData.disabledRowKeys = new Set(keys);
  };

  /**
   * 为节点添加子节点
   * @param {{ [key:string]: any }} currentNode 当前节点
   * @param {Array<{ [key:string]: any }>} appendNodes 当前节点下级数据
   * @return {void}
   */
  appendData = (currentNode, appendNodes) => {
    const cachedData = this.__getDataByRowKey(currentNode[this.tDataSetting.rowKey]);

    const hasChild = this.tDataSetting.hasChild(cachedData);
    if (hasChild) {
      const newData = {
        ...cachedData,
        [this.tDataSetting.childKey]: [
          ...cachedData[this.tDataSetting.childKey],
          ...(appendNodes || []),
        ],
      };
      this.innerData.rowKeyItemMap.set(`${newData[this.tDataSetting.rowKey]}`, newData);
    } else {
      const newData = { ...cachedData, [this.tDataSetting.childKey]: appendNodes };
      this.innerData.rowKeyItemMap.set(`${newData[this.tDataSetting.rowKey]}`, newData);
    }

    (appendNodes || []).forEach((appendNode, index) => {
      this.markData(
        appendNode,
        cachedData.childCount + index + 1,
        cachedData.layer + 1,
        cachedData.treeKey,
      );
    });
  };

  /**
   * 注册，添加 virtualLayer属性
   * @param {{ [key:string]: any }} nodeData 根节点数据
   * @param {number} index 当前层级中的序列
   * @param {number} virtualLayer 当前层级
   * @param {string} root 父级节点treeKey
   * @return {void}
   */
  markData = (nodeData, index, virtualLayer = 1, root = this.tDataSetting.rootKey) => {
    // 节点不存在
    if (!nodeData || !(typeof nodeData === 'object') || !(this.tDataSetting.rowKey in nodeData)) {
      return;
    }

    // key值重复,报警告
    if (this.innerData.rowKeyItemMap.has(`${nodeData[this.tDataSetting.rowKey]}`)) {
      return;
    }

    const dealedData = { ...nodeData };

    // ⭐为节点添加属性
    dealedData.layer = virtualLayer;
    dealedData.treeKey = `${root}${this.tDataSetting.treeKeySplit}${
      nodeData[this.tDataSetting.rowKey]
    }`;
    dealedData.childCount = 0;
    // ⭐为节点添加属性  end

    // 计算节点index
    const directParentRow = this.innerData.rowKeyItemMap.get(
      `${this.__getRowKeyByTreeKey(root)}`,
    ) || { binaryIndex: convertTenToBinary(0) };
    dealedData.binaryIndex = `${directParentRow.binaryIndex}${convertTenToBinary(index)}`;

    // 更新父节点treeKeyDirectSubsMap
    if (this.innerData.treeKeyDirectSubsMap.has(root)) {
      this.innerData.treeKeyDirectSubsMap.set(
        root,
        this.innerData.treeKeyDirectSubsMap.get(root).add(dealedData.treeKey),
      );
    } else {
      this.innerData.treeKeyDirectSubsMap.set(root, new Set([dealedData.treeKey]));
    }

    // 更新父节点childCount / treeKeySubsMap
    const pKeySplits = root.split(this.tDataSetting.treeKeySplit);
    for (let i = 0, len = pKeySplits.length; i < len; i++) {
      const pKey = pKeySplits[i];
      const pTreeKey = pKeySplits.slice(0, i + 1).join(this.tDataSetting.treeKeySplit);

      // 更新父节点高度
      if (this.innerData.rowKeyItemMap.has(pKey)) {
        const pMap = this.innerData.rowKeyItemMap.get(pKey);
        pMap.childCount++;
        this.innerData.rowKeyItemMap.set(pKey, pMap);
      }

      // 更新treeKey: Set(subs)
      let subs = new Set();
      if (this.innerData.treeKeySubsMap.has(pTreeKey)) {
        subs = this.innerData.treeKeySubsMap.get(pTreeKey);
      }
      subs.add(dealedData.treeKey);
      this.innerData.treeKeySubsMap.set(pTreeKey, subs);
    }

    // 记录禁用Keys
    if (this.tDataSetting.isDisabled(dealedData)) {
      this.innerData.disabledRowKeys.add(dealedData[this.tDataSetting.rowKey]);
    }

    // 存储rowKey/treeKey与单条内容映射
    this.innerData.rowKeyItemMap.set(`${dealedData[this.tDataSetting.rowKey]}`, dealedData);

    // 节点不含有子节点
    if (!this.tDataSetting.hasChild(dealedData)) {
      return;
    }

    for (let i = 0, len = dealedData[this.tDataSetting.childKey].length; i < len; i++) {
      const element = dealedData[this.tDataSetting.childKey][i];
      this.markData(element, i + 1, virtualLayer + 1, dealedData.treeKey);
    }
  };

  /**
   * 自动添加下级
   * @param {string|number} currentKey 当前节点rowKey
   * @param {Array<string|number>} checkedKeys 已选列表
   * @param {Array<string|number>} halfCheckedKeys 半选列表
   * @return {void}
   */
  autoCheckSubs = (currentKey, checkedKeys, halfCheckedKeys) => {
    const keys = this.__getTreeKeySubs(this.__getTreeKeyByRowKey(currentKey)).map(i =>
      this.__getRowKeyByTreeKey(i),
    );
    const disabledKeys = this.innerData.disabledRowKeys;

    const newCheckedKeys = Array.from(new Set([...checkedKeys, ...keys])).filter(
      i => !disabledKeys.has(i),
    );

    return {
      checkedKeys: newCheckedKeys,
      halfCheckedKeys,
      checkedRows: this.getDataByRowKeys(newCheckedKeys),
      halfCheckedRows: this.getDataByRowKeys(halfCheckedKeys),
    };
  };

  /**
   * 搜索数据，生成搜索树
   * @param {string} searchVal 搜索的内容
   * @return {void}
   */
  onSearch = searchVal => {
    // console.time('onSearch');
    if (!searchVal) {
      return {
        data: [],
        expandedKeys: [],
      };
    }

    const perfectMatchKeys = new Set();
    const canOperateKeys = new Set();

    // 查询
    const entries = this.innerData.rowKeyItemMap.entries();
    for (let i = 0, size = this.innerData.rowKeyItemMap.size; i < size; i++) {
      const [, item] = entries.next().value;

      if (item && item[this.tDataSetting.viewKey].includes(searchVal)) {
        perfectMatchKeys.add(item[this.tDataSetting.rowKey]);
        canOperateKeys.add(item[this.tDataSetting.rowKey]);
        (this.__getTreeKeySubs(item.treeKey) || []).forEach(tK => {
          canOperateKeys.add(this.__getRowKeyByTreeKey(tK));
        });
      }
    }

    const result = Array.from(perfectMatchKeys);

    return {
      data: this.getTreeData(result, true),
      expandedKeys: result,
      canOperateKeys: Array.from(canOperateKeys),
    };
  };

  onLiveSearch = searchVal => {
    if (!searchVal) {
      return {
        data: [],
        expandedKeys: [],
      };
    }

    const perfectMatchKeys = new Set();
    const canOperateKeys = new Set();

    // 查询
    const entries = this.innerData.rowKeyItemMap.entries();
    for (let i = 0, size = this.innerData.rowKeyItemMap.size; i < size; i++) {
      const [, item] = entries.next().value;

      if (item && item[this.tDataSetting.viewKey].includes(searchVal)) {
        perfectMatchKeys.add(item[this.tDataSetting.rowKey]);
        canOperateKeys.add(item[this.tDataSetting.rowKey]);
        (this.__getTreeKeySubs(item.treeKey) || []).forEach(tK => {
          canOperateKeys.add(this.__getRowKeyByTreeKey(tK));
        });
      }
    }

    const result = Array.from(perfectMatchKeys);

    return {
      searchSelectData: result.map(itemKey => this.__getDataByRowKey(itemKey)),
    };
  };

  // /**
  //  * 全树减枝成搜索树
  //  */
  // __searchTreeBuild = (nowData, searchVal, perfectMatchKeys) => {

  //   if (!nowData) {
  //     return false;
  //   }
  //   const { [this.tDataSetting.rowKey]: rowKey, [this.tDataSetting.childKey]: child, [this.tDataSetting.viewKey]: view } = nowData;

  //   let match = false;

  //   if (view.includes(searchVal)) {
  //     match = true;
  //     perfectMatchKeys.add(rowKey);
  //   }

  //   if (this.tDataSetting.hasChild(nowData)) {
  //     for (let i = child.length - 1; i >= 0; i --) {
  //       const childData = child[i];
  //       const subMatch = this.__searchTreeBuild(childData, searchVal, perfectMatchKeys);

  //       if (subMatch) {
  //         match = subMatch;
  //       } else {
  //         child.splice(i, 1);
  //       }
  //     }
  //   }

  //   return match;
  // }

  /**
   * 获取可展示的keys
   * @param {Array<string|number>} expandedKeys 已展开节点的key值
   * @param {number} realScrollTop dom top距离
   * @return {void}
   */
  getVisibleRowKeys = (expandedKeys, realScrollTop) => {
    // 从第几行开始展示
    const startIndex =
      realScrollTop > 0 ? Math.ceil(realScrollTop / this.tViewSetting.rowHeight) : 0;

    // 展示数量
    const chairs = Math.ceil(this.tViewSetting.clientHeight / this.tViewSetting.rowHeight);

    // 记录可见rowKeys
    let visibleRowKeys = [];

    // expandedKeys转化为treeKey
    let dealedExpandedKeys = expandedKeys.map(key => this.__getTreeKeyByRowKey(key));
    if (!dealedExpandedKeys.includes(this.tDataSetting.rootKey)) {
      dealedExpandedKeys.unshift(this.tDataSetting.rootKey);
    }

    // 本次展开的/搜索的款项与上次不一致； 则需要重新获取虚拟树
    const expandedKeysToStr = dealedExpandedKeys.sort().join(',');
    if (this.innerData.expandedTreeKeysStr !== expandedKeysToStr) {
      // 记录可见treeKeys
      const visibleTreeKeys = new Set();

      // 清除父级未展开的key
      dealedExpandedKeys = this.__filterExpandedTreeKeys(dealedExpandedKeys);

      // 添加虚拟树[treeKey]
      dealedExpandedKeys.forEach(i => {
        visibleTreeKeys.add(i);

        // 取出直接下级
        (this.innerData.treeKeyDirectSubsMap.get(i) || []).forEach(k => {
          visibleTreeKeys.add(k);
        });
      });

      visibleTreeKeys.delete(this.tDataSetting.rootKey);

      // console.time('visibleRows');
      // 获取可见rowKeys并排序
      visibleRowKeys = Array.from(visibleTreeKeys)
        .map(i => this.__getDataByTreeKey(i))
        .sort(this.__dataSortByBinaryIndex)
        .map(i => i[this.tDataSetting.rowKey]);

      // console.timeEnd('visibleRows');

      // record
      this.innerData.expandedTreeKeysStr = expandedKeysToStr;
      this.innerData.treeRowKeys = visibleRowKeys;
    } else {
      visibleRowKeys = this.innerData.treeRowKeys;
    }

    // 重置虚拟高度
    this.outerData.virtualHeight = visibleRowKeys.length;
    // 切割可见keys, 前后各挪chairs个
    const fromIndex = startIndex - chairs > 0 ? startIndex - chairs : 0;
    const endIndex = startIndex + chairs + chairs;
    visibleRowKeys = visibleRowKeys.slice(fromIndex, endIndex);
    // 重设树scrollTop高度
    this.outerData.viewScrollTop = fromIndex * this.tViewSetting.rowHeight;

    this.innerData.viewRowKeys = visibleRowKeys;
    // console.timeEnd('getVisibleRowKeys');
  };

  /**
   * 获取可展示列
   * @param {Array<string|number>} expandedKeys 已展开节点的key值
   * @param {number} realScrollTop dom滚动距离
   * @return {Array<{ [key:string]: any }>}
   */
  getVisibleItems = (expandedKeys, realScrollTop) => {
    this.getVisibleRowKeys(expandedKeys, realScrollTop);
    return this.innerData.viewRowKeys.map(key => this.__getDataByRowKey(key)).filter(i => !!i);
  };

  /**
   * 获取scrollTop
   * @return {number}
   */
  getViewScrollTop = () => {
    return this.outerData.viewScrollTop;
  };

  /**
   * 获取视图虚拟高度
   * @return {number}
   */
  getViewHeight = () => {
    return this.outerData.virtualHeight;
  };

  /**
   * 点击事件
   * @param {string|number} nowCheckedKey 当前行rowKey
   * @param {Array<string|number>} inputCheckedKeys 已选列表
   * @param {Array<string|number>} inputHalfCheckedKeys 半选列表
   * @return {void}
   */
  onCheck = (nowCheckedKey, inputCheckedKeys, inputHalfCheckedKeys) => {
    // 选中项keys
    const checked = new Set(inputCheckedKeys.map(i => this.__getTreeKeyByRowKey(i)));
    // 半选中项keys
    const halfChecked = new Set(inputHalfCheckedKeys.map(i => this.__getTreeKeyByRowKey(i)));

    // nowCheckedKey -> treeKey
    const checkOne = this.__getTreeKeyByRowKey(nowCheckedKey);
    // 下级所有treeKey
    const subTreeKeys = this.__getTreeKeySubs(checkOne);
    // 当前treeKey切割
    const treeKeySplit = checkOne.split(this.tDataSetting.treeKeySplit);
    const treeKeySplitLen = treeKeySplit.length;

    // checkOne未在已选列表的处理
    if (!checked.has(checkOne)) {
      // console.time('add');

      // 自身加入已选列表
      checked.add(checkOne);
      // 自身移除半选列表
      halfChecked.delete(checkOne);

      // 下级节点加入已选列表
      for (let i = 0, len = subTreeKeys.length; i < len; i++) {
        const tK = subTreeKeys[i];
        checked.add(tK);
        halfChecked.delete(tK);
      }

      // 父级元素添加到halfCheck或check
      // 注：__treeKeyItemMap内无this.treeVirtualStart
      // 从最近父节点开始处理，逐渐往上
      let mustBeHalf = false;
      let latestParentChildCount = null;
      for (let i = treeKeySplitLen - 1; i >= 1; i--) {
        const pKey = treeKeySplit.slice(0, i).join(this.tDataSetting.treeKeySplit);
        if (pKey === this.tDataSetting.rootKey) {
          break;
        }

        const pRow = this.__getDataByTreeKey(pKey);
        if (!pRow) {
          // eslint-disable-next-line
          continue;
        }

        // 更新latestParentChildCount
        if (latestParentChildCount === null) {
          latestParentChildCount = this.__getTreeKeySubs(pKey, checked).length;
        }

        const pRowDisabledSubs = this.__getDisabledSubNodesCount(pRow);
        // 该父级下已选中节点个数和该父级的子节点个数一致
        if (
          !mustBeHalf &&
          (latestParentChildCount >= pRow.childCount - pRowDisabledSubs ||
            this.__getTreeKeySubs(pKey, checked).length >= pRow.childCount - pRowDisabledSubs)
        ) {
          halfChecked.delete(pKey);
          checked.add(pKey);
          latestParentChildCount++;
        } else {
          mustBeHalf = true;
          checked.delete(pKey);
          halfChecked.add(pKey);
        }
      }
    } else {
      // 自身移除已选列表
      checked.delete(checkOne);
      // 自身移除半选列表
      halfChecked.delete(checkOne);

      // 下级节点移除已选列表
      for (let i = 0, len = subTreeKeys.length; i < len; i++) {
        const tK = subTreeKeys[i];
        checked.delete(tK);
        halfChecked.delete(tK);
      }

      // 父级元素添加到halfCheck
      // 注：不let i = 0; 因为__treeKeyItemMap内无this.treeVirtualStart
      let mustBeHalf = false;
      for (let i = treeKeySplitLen - 1; i >= 1; i--) {
        const pKey = treeKeySplit.slice(0, i).join(this.tDataSetting.treeKeySplit);
        if (pKey === this.tDataSetting.rootKey) {
          break;
        }

        checked.delete(pKey);
        halfChecked.delete(pKey);
        // 该父级下已选中节点个数不为空，则加入半选列表
        if (mustBeHalf || this.__getTreeKeySubs(pKey, checked).length !== 0) {
          halfChecked.add(pKey);
          mustBeHalf = true;
        }
      }
    }

    const disabledKeys = this.innerData.disabledRowKeys;
    const checkedKeys = Array.from(checked)
      .map(i => this.__getRowKeyByTreeKey(i))
      .filter(i => !disabledKeys.has(i));
    const halfCheckedKeys = Array.from(halfChecked)
      .map(i => this.__getRowKeyByTreeKey(i))
      .filter(i => !disabledKeys.has(i));

    return {
      checkedKeys,
      halfCheckedKeys,
    };
  };

  /**
   * 根据checkedKeys补全checkedKeys与halfCheckedKeys
   * @param {Array<string|number>} inputCheckedKeys 传入的已选列表
   * @return {void}
   */
  completeCheckedKeys = inputCheckedKeys => {
    // console.time('completeCheckedKeys');
    const checkedTreeKeys = new Set();
    const halfCheckedTreeKeys = new Set();

    const needCalParentTreeKeys = new Set();
    const parentSubsCount = new Map();

    // console.time('inputCheckedKeys');

    let dealedInputCheckedKeys = inputCheckedKeys
      .map(i => this.__getDataByRowKey(i))
      .sort(this.__dataSortByBinaryIndex);
    dealedInputCheckedKeys = dealedInputCheckedKeys.map(i => (i ? i.treeKey : 'none'));
    dealedInputCheckedKeys.forEach(nTreeKey => {
      if (nTreeKey === 'none') {
        return;
      }

      if (checkedTreeKeys.has(nTreeKey)) {
        return;
      }

      // 当前treeKey切割
      const treeKeySplit = nTreeKey.split(this.tDataSetting.treeKeySplit);
      const treeKeySplitLen = treeKeySplit.length;

      // 当前key值添加至checkedTreeKey
      checkedTreeKeys.add(nTreeKey);
      halfCheckedTreeKeys.delete(nTreeKey);

      // 下级添加进checkedTreeKey
      const subs = this.__getTreeKeySubs(nTreeKey);
      subs.forEach(i => {
        halfCheckedTreeKeys.delete(i);
        checkedTreeKeys.add(i);
      });

      const currentSubsCount = subs.length + 1;
      // 从最近父节点开始处理，逐渐往上
      for (let i = treeKeySplitLen - 2; i >= 1; i--) {
        const pTreeKey = treeKeySplit.slice(0, i + 1).join(this.tDataSetting.treeKeySplit);
        const pKey = treeKeySplit[i];

        needCalParentTreeKeys.add(pTreeKey);

        let tmp = currentSubsCount;
        if (parentSubsCount.has(pKey)) {
          tmp += parentSubsCount.get(pKey);
        }
        parentSubsCount.set(pKey, tmp);
      }
    });

    // console.timeEnd('inputCheckedKeys');

    // 父级添加
    Array.from(needCalParentTreeKeys)
      .sort(this.__treeKeySortBySplitStr)
      .forEach(pTreeKey => {
        const pRow = this.__getDataByTreeKey(pTreeKey);
        const pKey = `${pRow[this.tDataSetting.rowKey]}`;

        // 该父级下已选中节点个数和该父级的子节点个数一致
        const pRowDisabledSubs = this.__getDisabledSubNodesCount(pRow);
        if (parentSubsCount.get(pKey) >= pRow.childCount - pRowDisabledSubs) {
          halfCheckedTreeKeys.delete(pTreeKey);
          checkedTreeKeys.add(pTreeKey);

          // 更新父级
          for (
            let treeKeySplit = pTreeKey.split(this.tDataSetting.treeKeySplit),
              i = treeKeySplit.length - 2;
            i >= 1;
            i--
          ) {
            const currentPKey = treeKeySplit[i];

            let tmp = 1;
            if (parentSubsCount.has(currentPKey)) {
              tmp += parentSubsCount.get(currentPKey);
            }
            parentSubsCount.set(currentPKey, tmp);
          }
        } else {
          checkedTreeKeys.delete(pTreeKey);
          halfCheckedTreeKeys.add(pTreeKey);
        }
      });

    checkedTreeKeys.delete(this.tDataSetting.rootKey);
    halfCheckedTreeKeys.delete(this.tDataSetting.rootKey);

    const disabledKeys = this.innerData.disabledRowKeys;
    const checkedKeys = Array.from(checkedTreeKeys)
      .map(i => this.__getRowKeyByTreeKey(i))
      .filter(i => !disabledKeys.has(i));
    const halfCheckedKeys = Array.from(halfCheckedTreeKeys)
      .map(i => this.__getRowKeyByTreeKey(i))
      .filter(i => !disabledKeys.has(i));

    // console.timeEnd('completeCheckedKeys');
    return {
      checkedKeys,
      halfCheckedKeys,
      checkedRows: this.getDataByRowKeys(checkedKeys),
      halfCheckedRows: this.getDataByRowKeys(halfCheckedKeys),
    };
  };

  /**
   * 根据外部传入expandedKeys补全
   * @param {Array<string|number>} inputExpandedKeys 传入的展开列表
   * @return {void}
   */
  completeExpandedKeys = inputExpandedKeys => {
    const resultKeySet = new Set();

    inputExpandedKeys
      .map(i => this.__getTreeKeyByRowKey(i))
      .filter(i => i !== 'none')
      .forEach(treeKey => {
        if (resultKeySet.has(treeKey)) {
          return;
        }

        // 添加treeKey
        resultKeySet.add(treeKey);

        // 添加父级
        const treeKeySplit = treeKey.split(this.tDataSetting.treeKeySplit);
        const treeKeySplitLen = treeKeySplit.length;

        for (let i = treeKeySplitLen - 1; i >= 1; i--) {
          const parentKey = treeKeySplit.slice(0, i).join(this.tDataSetting.treeKeySplit);
          if (resultKeySet.has(parentKey)) {
            break;
          }
          resultKeySet.add(parentKey);
        }
      });

    return Array.from(resultKeySet).map(i => this.__getRowKeyByTreeKey(i));
  };

  /**
   * 根据keys获取数据
   * @param {Array<string|number>} keyArr 根据rowKey数组获取节点对象数组
   * @return {Array<{ [key:string]: any }>}
   */
  getDataByRowKeys = keyArr => {
    return keyArr.map(i => this.getDataByRowKey(i)).filter(i => !!i);
  };

  /**
   * 根据key获取数据
   * @param {string|number} key rowKey
   * @return {{ [key:string]: any }}
   */
  getDataByRowKey = key => {
    const data = this.innerData.rowKeyItemMap.get(`${key}`);
    if (!data) {
      return null;
    }
    return { ...data, [this.tDataSetting.childKey]: null };
  };

  /**
   * 获取列表型（所有）数据
   * @return {Array<{ [key:string]: any }>}
   */
  getListData = () => {
    return [...this.innerData.rowKeyItemMap.values()];
  };

  /**
   * 根据rowKey生成树
   * @param {Array<string|number>} rowKeyArr 用于构建树的数据keys
   * @param {boolean} needParent 是否挂靠在父级上
   * @param {boolean} needChild 是否需子级挂靠
   * @return {Array<{ [key:string]: any }>}
   */
  getTreeData = (rowKeyArr, needParent = true, needChild = true) => {
    const treeKeyItemMap = new Map();
    const needRemoveKeys = new Set();

    // 根据入参取值
    const sortedItemArr = rowKeyArr
      .map(i => this.__getDataByRowKey(i))
      .sort(this.__dataSortByBinaryIndex);

    sortedItemArr.forEach(item => {
      if (!item) {
        return;
      }

      const { treeKey: currentTreeKey } = item;

      if (needRemoveKeys.has(currentTreeKey)) {
        return;
      }
      // 自身和自身子孙挂靠
      if (needChild) {
        const currentSubsTreeKey = this.tDataSetting.hasChild(item)
          ? this.__getTreeKeySubs(currentTreeKey)
          : [];
        const currentSubTreeKey = Array.from(
          this.innerData.treeKeyDirectSubsMap.get(currentTreeKey) || [],
        );
        treeKeyItemMap.set(currentTreeKey, {
          ...item,
          [this.tDataSetting.childKey]: currentSubTreeKey.map(i => this.__getDataByTreeKey(i)),
        });
        currentSubsTreeKey.forEach(subTreeKey => {
          needRemoveKeys.add(subTreeKey);
        });
      } else {
        treeKeyItemMap.set(currentTreeKey, { ...item, [this.tDataSetting.childKey]: [] });
      }

      // 传入值挂靠
      const directParentTreeKey = currentTreeKey.substring(
        0,
        currentTreeKey.lastIndexOf(this.tDataSetting.treeKeySplit),
      );
      if (treeKeyItemMap.has(directParentTreeKey)) {
        needRemoveKeys.add(currentTreeKey);

        const directParentItem = treeKeyItemMap.get(directParentTreeKey);
        directParentItem[this.tDataSetting.childKey].push(treeKeyItemMap.get(currentTreeKey));
        treeKeyItemMap.set(directParentTreeKey, directParentItem);
      }

      // 需要挂靠父级
      if (needParent) {
        const tmpTreeKeys = currentTreeKey.split(this.tDataSetting.treeKeySplit);
        for (let i = tmpTreeKeys.length - 1; i >= 1; i--) {
          const parentTreeKey = tmpTreeKeys.slice(0, i).join(this.tDataSetting.treeKeySplit);
          const childTreeKey = tmpTreeKeys.slice(0, i + 1).join(this.tDataSetting.treeKeySplit);

          if (needRemoveKeys.has(childTreeKey)) {
            // eslint-disable-next-line
            continue;
          }

          if (parentTreeKey === this.tDataSetting.rootKey) {
            // eslint-disable-next-line
            continue;
          }

          // 当前节点未进行父子处理
          const childItem = treeKeyItemMap.get(childTreeKey);
          let parentItem;
          if (treeKeyItemMap.has(parentTreeKey)) {
            parentItem = treeKeyItemMap.get(parentTreeKey);
          } else {
            parentItem = {
              ...this.innerData.rowKeyItemMap.get(tmpTreeKeys[i - 1]),
              [this.tDataSetting.childKey]: [],
            };
          }
          parentItem[this.tDataSetting.childKey].push(childItem);

          treeKeyItemMap.set(parentTreeKey, parentItem);

          needRemoveKeys.add(childTreeKey);
        }
      }
    });

    // 移除子级
    Array.from(needRemoveKeys).forEach(key => {
      treeKeyItemMap.delete(key);
    });

    // 返回数据
    const retValue = Array.from(treeKeyItemMap.values()).sort(this.__dataSortByBinaryIndex);

    // 添加childCount
    const addChildCount = node => {
      if (
        Array.isArray(node[this.tDataSetting.childKey]) &&
        node[this.tDataSetting.childKey].length !== 0
      ) {
        let currentChildCount = 0;
        node[this.tDataSetting.childKey].forEach(item => {
          item.childCount = addChildCount(item);
          currentChildCount += item.childCount + 1;
        });
        node.childCount = currentChildCount;
      } else {
        node.childCount = 0;
      }

      return node.childCount;
    };

    if (retValue.length !== 0) {
      retValue.forEach(item => {
        addChildCount(item);
      });
    }

    return retValue;
  };

  /**
   * 根据rowKey获取从 根 开始的数据
   * @param {string|number} key rowKey
   * @return {Array<{ [key:string]: any }>}
   */
  getLayerDataByRowKey = key => {
    const treeKey = this.__getTreeKeyByRowKey(key);

    return this.getDataByRowKeys(treeKey.split(this.tDataSetting.treeKeySplit));
  };

  /**
   * 判断rowKey2是否在rowKey1的子树中
   * @param {string|number} rowKey1 rowKey
   * @param {string|number} rowKey2 rowKey
   * @return {boolean}
   */
  isSubs = (rowKey1, rowKey2) => {
    const treeKey2 = this.__getTreeKeyByRowKey(rowKey2);
    const splitTreeKey2 = treeKey2.split(this.tDataSetting.treeKeySplit);

    return splitTreeKey2.includes(`${rowKey1}`);
  };

  /**
   * 判断rowKey节点是否存在子节点
   * @param {string|number} rowKey
   */
  hasSubs = rowKey => {
    const node = this.__getDataByRowKey(rowKey);
    if (!node) {
      return false;
    }

    const currentTreeKey = node.treeKey;
    const subsArr = this.__getTreeKeySubs(currentTreeKey);
    return subsArr.length > 0;
  }

  /**
   * 清洗expandedKeys,抛出给外部
   * @param {[]} expandedKeys
   */
  filterExpandedKeysForOuter = expandedKeys => {
    const filteredTreeKeys = this.__filterExpandedTreeKeys(expandedKeys.map(this.__getTreeKeyByRowKey));
    if (filteredTreeKeys.includes(this.tDataSetting.rootKey)) {
      filteredTreeKeys.splice(filteredTreeKeys.indexOf(this.tDataSetting.rootKey), 1);
    }
    return filteredTreeKeys.map(this.__getRowKeyByTreeKey);
  }

  /**
   * 获取当前节点禁用的下级节点
   */
  __getDisabledSubNodesCount = node => {
    if (!node) {
      return 0;
    }

    let count = 0;
    const currentTreeKey = node.treeKey;
    this.innerData.disabledRowKeys.forEach(tmpNodeRowKey => {
      const tmpNode = this.__getDataByRowKey(tmpNodeRowKey);
      if (!tmpNode) {
        console.log('【VirtualizedTree】该键值数据在树内存中不存在：', tmpNodeRowKey);
        return;
      }

      if (tmpNode.treeKey.includes(currentTreeKey) && currentTreeKey !== tmpNode.treeKey) {
        count++;
      }
    });

    return count;
  };

  __getDataByTreeKey = treeKey => {
    const realKey = treeKey.substring(
      treeKey.lastIndexOf(this.tDataSetting.treeKeySplit) + 1,
      treeKey.length,
    );
    return this.innerData.rowKeyItemMap.get(`${realKey}`);
  };

  __getDataByRowKey = rowKey => {
    return this.innerData.rowKeyItemMap.get(`${rowKey}`);
  };

  __getTreeKeyByRowKey = (rowKey = '') => {
    const item = this.innerData.rowKeyItemMap.get(`${rowKey}`);
    if (item) {
      return item.treeKey;
    }
    return 'none';
  };

  __getRowKeyByTreeKey = treeKey => {
    const strRowKey = treeKey.substring(
      treeKey.lastIndexOf(this.tDataSetting.treeKeySplit) + 1,
      treeKey.length,
    );

    if (this.tDataSetting.rowKeyType === 'number') {
      return parseFloat(strRowKey);
    }

    return strRowKey;
    // const row = this.__getDataByRowKey(strRowKey) || {};
    // return row[this.tDataSetting.rowKey];
  };

  // 清除父级未展开的子级keys
  __filterExpandedTreeKeys = keys => {
    keys.sort(this.__treeKeySortBySplitStrAsc);

    // console.time('__filterExpandedTreeKeys');
    const retValue = new Set();
    retValue.add(this.tDataSetting.rootKey);

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];

      // 虚拟根节点不做处理
      if (key === this.tDataSetting.rootKey) {
        // eslint-disable-next-line
        continue;
      }

      if (!retValue.has(key.substring(0, key.lastIndexOf(this.tDataSetting.treeKeySplit)))) {
        // eslint-disable-next-line
        continue;
      }

      retValue.add(key);
    }

    // console.timeEnd('__filterExpandedTreeKeys');
    return Array.from(retValue);
  };

  __getTreeKeySubs = (treeKey, arrOrSet = null) => {
    if (arrOrSet === null) {
      return Array.from(this.innerData.treeKeySubsMap.get(treeKey) || []);
    }

    const row = this.__getDataByTreeKey(treeKey);
    if (row.childCount === 0) {
      return [];
    }

    return Array.from(arrOrSet).filter(item =>
      item.includes(`${treeKey}${this.tDataSetting.treeKeySplit}`),
    );
  };

  // sort treeKey by splitStr count desc
  __treeKeySortBySplitStr = (a, b) => {
    return (
      b.split(this.tDataSetting.treeKeySplit).length -
      a.split(this.tDataSetting.treeKeySplit).length
    );
  };

  // sort treeKey by splitStr count asc
  __treeKeySortBySplitStrAsc = (a, b) => {
    return (
      a.split(this.tDataSetting.treeKeySplit).length -
      b.split(this.tDataSetting.treeKeySplit).length
    );
  };

  // sort data by binaryIndex
  __dataSortByBinaryIndex = (aRow, bRow) => {
    if (!aRow) {
      return -1;
    }

    if (!bRow) {
      return 1;
    }

    return aRow.binaryIndex < bRow.binaryIndex ? -1 : 1;
  };
}
