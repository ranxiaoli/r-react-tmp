import React, { PureComponent } from 'react';
import { Empty } from 'antd';
import PropTypes from 'prop-types';

import Scrollbar from 'react-custom-scrollbars';
import Searcher from './mod/Searcher';
import TreeNode from './mod/TreeNode';
import HighlightText from './mod/HighlightText';

import VirtualizeTree from './utils/VirtualizeTree';
import { throttle } from './utils/utils';

import {
  STATICS,
  CSS_PREFIX,
  DEFAULT_PROPS,
  hasChild,
  isDisableCheckbox,
  isDisabledKeysApply,
} from './constant.js';

import './style/index.less'

/**
 * 前端搜索-可视区域资源树; 请保证construtor内可读取到初始dataSetting
 * POINT: 组件使用了ES6数据结构，请保证项目中含babel以兼容低版本浏览器
 * @param data 树形数据[node1, node2]
 * @param dataSetting 树形数据设置
 *     {
 *        // 数据主键  eg: {id: '1'}, {id: '2'}, 则 dataKey: 'id'
 *        dataKey: string,
 *        // 数据展示文本键值  eg: { id: '1', name: 'www' }, 则dataKey: 'name'
 *        dataViewKey: string,
 *        // 数据是否存在子节点, 该规则使用方可自己定义，  否则默认使用  nodeData[childArrayKey] 做判断
 *        hasChild?: (treeNode) => boolean
 *        // 子节点键值  eg: { id: '1', child: [{id: '2'}]}, 则 childArrayKey: 'child'
 *        childArrayKey: string,
 *        // 异步加载数据，当且仅当为异步函数时图标才会有loading效果
 *        loadData?: (data) => Promise<{isSuccess: boolean, data: array}>,
 *        // 是否异步加载子节点, 该规则使用方可自己定义，  否则默认  false
 *        needLoadData?: (treeNode) => boolean
 *        // treeKey内的连接符，不对外公布的对象; 请确保该字符串在dataKey中不存在
 *        treeKeySplit?: 树内部使用
 *     }
 * @param viewSetting 视高设置
 *    {
 *       // 树组件视高
 *       treeHeight: number,
 *    }
 * @param treeNodeRender? 节点渲染
 *    （nodeData, searchText, isChecked, isExpanded, isSelected) => { disableCheckbox: boolean, disabled: boolean, content: ReactNode, icon: ReactNode, title: string }
 *
 * @param checkable?  节点前添加Checkbox复选框 default: false
 * @param checkStrictly? checkable 状态下节点选择完全受控（父子节点选中状态不再关联）
 * @param hasSearch? 是否添加搜索框【前端搜索】
 * @param searchSetting? 搜索框setting
 *     {
 *         placeholder?: string,
 *         size?: 'small' | 'default' | 'large',
 *         disabled?: boolean,
 *         onLiveSearchClick?: (node: 数据) => void
 *     }
 * @param switcherIcon? 自定义树节点的展开/折叠图标 expect: React.ReactElement [beta 鸡肋]
 *
 * @param defaultCheckedKeys? 默认勾选的树节点 default: [],  必须保证constructor能获取到data
 * @param defaultExpandedKeys? 默认展开的树节点 default: [], 必须保证constructor能获取到data
 * @param defaultSelectedKey? 默认选中的树节点 default: ''
 *
 * @param checkedKeys? （受控）设置选中的树节点
 * @param selectedKey?: (受控) 设置选中的树节点
 * @param loadedKeys? （受控）已加载的节点，需配合loadData使用
 * @param expandedKeys? (受控) 设置展开的树节点
 * @param disabledKeys?: 禁用的节点，禁用checkbox 以及 点击事件
 *
 * @param onCheck? 点击复选框触发
 *    function({checkedKeys: Array(), halfCheckedKeys: Array(), checkedRows: Array(), halfCheckedRows: Array()}, currentNode, event) {}
 * @param onSearch? 搜索回调 => void | Promise(<{isSuccess: boolean, data: array, expandedKeys: array}>)
 * @param onLoadData? (dataKey) => {} 加载数据回调,仅提示
 * @param onSelect? (nodeData, targetNode, event) => void 内容区域点击回调
 * @param onExpand? (expandedKeys,(bool,node))=>{} 展开的回调 
 * @param scrollBarSetting? 滚动条样式
 *    {
 *        width: '8px',
 *        height: '8px',
 *        backgroundColor: 'rgba(0, 0, 0, 0.2)',
 *        renedrScrollBarStyle: {
 *            width: '8px',
 *            backgroundColor: 'rgba(0, 0, 0, 0.2)',
 *            borderRadius: '8px',
 *        }
 *    }
 */
class Tree extends PureComponent {

  treeElem = null;

  scrollBarElem = null;

  constructor(props) {
    super(props);

    const {
      defaultCheckedKeys,
      defaultExpandedKeys,
      defaultSelectedKey,
      disabledKeys,
      checkedKeys,
      dataSetting: { dataKey, childArrayKey, dataViewKey, treeKeySplit },
      dataSetting,
      data,
      treeNodeRender,
    } = props;

    if (treeKeySplit) {
      STATICS.TREE_KEY_SPLIT = treeKeySplit;
    }

    const virtualTree = new VirtualizeTree();
    virtualTree.initTree(
      dataKey,
      childArrayKey,
      dataViewKey,
      hasChild(dataSetting),
      isDisableCheckbox(treeNodeRender),
    );

    let check = { checkedKeys: [], halfCheckedKeys: [], checkedRows: [], halfCheckedRows: [] };
    let expandedKeys = [];
    let visibleItems = [];

    // 数据标注存储
    if (Array.isArray(data) && data.length !== 0) {
      virtualTree.initData(data);
    }

    // 设置disableKeys
    if (isDisabledKeysApply(treeNodeRender)) {
      virtualTree.setDisabledKeys(disabledKeys || []);
    }

    // 设置checkedKeys一类
    if (Array.isArray(data) && data.length !== 0) {
      // 清洗checkedKeys
      check = virtualTree.completeCheckedKeys(defaultCheckedKeys || checkedKeys || []);
      // 清洗expandedKeys
      expandedKeys = virtualTree.completeExpandedKeys(defaultExpandedKeys || expandedKeys || []);
      // 获取可见item
      visibleItems = virtualTree.getVisibleItems(expandedKeys, 0);
    }

    this.state = {
      // 已选中treeKey
      checkedKeys: check.checkedKeys,
      // 半勾选项treeKey
      halfCheckedKeys: check.halfCheckedKeys,
      // 虚拟树实例 star star star
      virtualTree,
      // 已展开
      expandedKeys,
      // 受控已加载key
      loadedKeys: [],
      // 异步树据加载中的key
      loadingKeys: [],
      // 已点击key
      selectedKey: defaultSelectedKey || '',
      // 搜索内容
      searchText: '',
      // 可见数据
      visibleItems,
      // 可见数据scrollTop
      itemScrollTop: 0,
      // 真实scrollTop
      realScrollTop: 0,

      // 搜索树把控
      searchTreeData: [],
      searchTreeExpandedKeys: [],
      searchTreeCanOperateKeys: [],

      // props传入数据(判断是否更新state)
      propsData: data,
      propsCheckedKeys: checkedKeys,
      propsExpandedKeys: [],
      propsDisabledKeys: disabledKeys,
    };
  }

  static getDerivedStateFromProps(nextProps, state) {
    // 更新设置
    const {
      dataSetting: { dataKey, childArrayKey, dataViewKey, treeKeySplit },
      dataSetting,
      treeNodeRender,
      disabledKeys,
    } = nextProps;
    if (treeKeySplit) {
      STATICS.TREE_KEY_SPLIT = treeKeySplit;
    }
    state.virtualTree.initTree(
      dataKey,
      childArrayKey,
      dataViewKey,
      hasChild(dataSetting),
      isDisableCheckbox(treeNodeRender),
    );

    let retVal = {};
    const isDataChanged = nextProps.data && nextProps.data !== state.propsData;

    // 谨慎！！请勿频繁更改data
    if (isDataChanged) {
      // 数据标注存储
      if (Array.isArray(nextProps.data)) {
        state.virtualTree.initData(nextProps.data);
      }

      const visibleData = state.virtualTree.getVisibleItems([], 0);
      const viewScrollTop = state.virtualTree.getViewScrollTop();
      const viewHeight = state.virtualTree.getViewHeight();

      retVal = {
        ...retVal,
        searchText: '',
        searchTreeData: [],
        propsData: nextProps.data,
        itemScrollTop: viewScrollTop,
        realScrollTop: 0,
        itemHeight: viewHeight,
        visibleItems: visibleData,
        expandedKeys: [],
      };
    }

    // disabledKeys变更
    if (isDisabledKeysApply(treeNodeRender) && state.propsDisabledKeys !== nextProps.disabledKeys) {
      state.virtualTree.setDisabledKeys(disabledKeys || []);
      retVal = {
        ...retVal,
        propsDisabledKeys: nextProps.disabledKeys,
      };
    }

    // 更新checkedKeys 、 halfCheckedKeys
    if (
      nextProps.checkedKeys &&
      (isDataChanged || nextProps.checkedKeys !== state.propsCheckedKeys)
    ) {
      let getChecked = {
        checkedKeys: nextProps.checkedKeys,
        halfCheckedKeys: [],
      };
      if (!nextProps.checkStrictly) {
        getChecked = state.virtualTree.completeCheckedKeys(nextProps.checkedKeys);
      }

      retVal = {
        ...retVal,
        checkedKeys: getChecked.checkedKeys,
        halfCheckedKeys: getChecked.halfCheckedKeys,
        checkedRows: getChecked.checkedRows,
        halfCheckedRows: getChecked.halfCheckedRows,
        propsCheckedKeys: nextProps.checkedKeys,
      };
    }

    if (
      typeof nextProps.selectedKey !== 'undefined' &&
      nextProps.selectedKey !== state.selectedKey
    ) {
      retVal = {
        ...retVal,
        selectedKey: nextProps.selectedKey,
      };
    }

    if (nextProps.loadedKeys && nextProps.loadedKeys !== state.loadedKeys) {
      retVal = {
        ...retVal,
        loadedKeys: nextProps.loadedKeys,
      };
    }

    if (
      nextProps.expandedKeys &&
      (isDataChanged || nextProps.expandedKeys !== state.propsExpandedKeys)
    ) {
      const expandedKeys = state.virtualTree.completeExpandedKeys(nextProps.expandedKeys);

      let visibleData = [];
      if (expandedKeys.length === 0) {
        visibleData = state.virtualTree.getVisibleItems(expandedKeys, 0);
      } else {
        visibleData = state.virtualTree.getVisibleItems(expandedKeys, retVal.realScrollTop);
      }

      const viewScrollTop = state.virtualTree.getViewScrollTop();
      const viewHeight = state.virtualTree.getViewHeight();

      retVal = {
        ...retVal,
        expandedKeys,
        visibleItems: visibleData,
        itemScrollTop: viewScrollTop,
        itemHeight: viewHeight,
        propsExpandedKeys: nextProps.expandedKeys,
      };
    }

    if (Object.keys(retVal).length === 0) {
      return null;
    }
    return retVal;
  }

  // 专处理scrollbar
  componentDidUpdate() {
    const { realScrollTop } = this.state;

    if (realScrollTop === 0) {
      this.scrollBarElem
        && this.scrollBarElem.scrollTop(0)
    }
  }

  componentDidMount() {
    this.getVisibleItem();
  }

  componentWillUnmount() {
    this.setState = () => { };
  }

  /**
   * APIS
   */

  /**
   * 根据dataKey获取单条数据以及列表型树枝数据
   * eg: def 数据层级为root->abc->def，传入def,返回{ node:{def}, layerNode: [{root}, {abc}, {def}]}
   * @param dataKey 数据key
   * @return { node: {}, layerNode: [] }
   */
  getDataByDataKey = dataKey => {
    const { virtualTree } = this.state;
    const currentNode = virtualTree.getDataByRowKey(dataKey);

    if (!currentNode) {
      return { node: null, layerNode: [] };
    }

    return {
      node: currentNode,
      layerNode: virtualTree.getLayerDataByRowKey(dataKey),
    };
  };

  /**
   * 获取列表型数据和数据条数
   * @param keys [key]
   */
  getListData = (keys = null) => {
    const { virtualTree } = this.state;

    if (virtualTree) {
      let listData;
      if (keys && Array.isArray(keys)) {
        listData = virtualTree.getDataByRowKeys(keys);
      } else {
        listData = virtualTree.getListData();
      }

      return {
        listData,
        num: listData.length,
      };
    }

    return {
      listData: [],
      num: 0,
    };
  };

  /**
   * 获取树形数据
   * @param dataKeys 用于构建树的数据keys
   * @param needParent 是否需要父级，生成从上至下的树
   */
  getTree = (dataKeys, needParent = false) => {
    const { checkStrictly } = this.props;
    const { virtualTree } = this.state;

    if (checkStrictly) {
      return virtualTree.getTreeData(dataKeys, needParent, false);
    }

    const calc = virtualTree.completeCheckedKeys(dataKeys);
    return virtualTree.getTreeData(calc.checkedKeys, needParent);
  };

  /**
   * 判断参数2是否在参数1的子树中
   * @param {any} upperDataKey 父级dataKey
   * @param {any} lowerDataKey 子级dataKey
   */
  isInSubTree = (upperDataKey, lowerDataKey) => {
    const { virtualTree } = this.state;
    return virtualTree.isSubs(upperDataKey, lowerDataKey);
  };

  /**
   * 被动调整树高度
   */
  resize = () => {
    this.getVisibleItem();
  };

  /**
   * 清空搜索状态
   */
  clearSearchState = () => {
    this.setState({
      searchText: '',
      searchTreeData: [],
    });
  };

  /**
   * APIS--END
   */

  /**
   * 获取可见数据
   * @param expandedKeys 展开的keys
   */
  getVisibleItem = (expandedKeys = null, realScrollTop = null) => {
    // 调整高度
    this.adjustSetting();

    const { expandedKeys: sEK, virtualTree, realScrollTop: rST } = this.state;
    const eKeys = expandedKeys === null ? sEK : expandedKeys;
    const calculateST = realScrollTop === null ? rST : realScrollTop;

    const visibleData = virtualTree.getVisibleItems(eKeys, calculateST);
    const viewScrollTop = virtualTree.getViewScrollTop();
    const viewHeight = virtualTree.getViewHeight();

    this.setState(() => {
      return {
        itemScrollTop: viewScrollTop,
        itemHeight: viewHeight,
        visibleItems: visibleData,
      };
    });
  };

  /**
   * 获取searcher高度
   * @return number(px)
   */
  getSearcherHeight = () => {
    const {
      hasSearch,
      searchSetting: { size },
    } = this.props;

    if (!hasSearch) {
      return 0;
    }

    return STATICS.SEARCHER_HEIGHT[size || 'default'];
  };

  // 调整高度
  adjustSetting = () => {
    const { viewSetting } = this.props;
    const { treeHeight } = viewSetting || {};
    const { virtualTree } = this.state;

    let viewHeight;
    if (treeHeight) {
      viewHeight = treeHeight;
    } else {
      // 获取clientHeight
      if (this.treeElem === null) {
        return;
      }

      // 获取父级高度，计算树形可用高度(减去父容器的padding)
      const treeElemParent = this.treeElem.parentNode;
      const {
        style: { paddingTop, paddingBottom },
        clientHeight,
      } = treeElemParent;

      const paddingGap = parseInt(paddingTop || 0, 10) + parseInt(paddingBottom || 0, 10);
      const searchGap = this.getSearcherHeight();
      const treeViewHeight = clientHeight - paddingGap - searchGap;

      if (treeViewHeight < STATICS.ROW_HEIGHT) {
        console.error('【VirtualizedTree】请为父级元素设置高度！');
      }

      viewHeight = treeViewHeight;
    }

    virtualTree.resizeTree(viewHeight);
  };

  /**
   * 判断是否异步加载数据
   */
  needLoadData = treeNode => {
    const {
      dataSetting: { needLoadData, dataKey },
    } = this.props;
    const { loadedKeys } = this.props;
    const { loadedKeys: sLKeys } = this.state;

    // 已展开
    if ((loadedKeys || sLKeys || []).includes(treeNode[dataKey])) {
      return false;
    }

    return needLoadData ? needLoadData(treeNode) : false;
  };

  /**
   * 当前树节点渲染,也应用至搜索树中
   */
  treeNodeRender = (data, _, isChecked, isExpanded, isSelected) => {
    const {
      treeNodeRender,
      dataSetting: { dataViewKey, dataKey },
      disabledKeys,
    } = this.props;
    const { searchText } = this.state;

    // 单行默认样式
    let defaultSetting = {
      disableCheckbox: false,
      disabled: false,
      icon: null,
      title: data[dataViewKey],
      content: <HighlightText text={data[dataViewKey]} mark={searchText} />,
    };

    // 存在disabledKeys且应用
    if (isDisabledKeysApply(treeNodeRender)) {
      defaultSetting.disableCheckbox = disabledKeys && disabledKeys.includes(data[dataKey]);
      defaultSetting.disabled = disabledKeys && disabledKeys.includes(data[dataKey]);
    }

    // 用户存在自定义
    if (treeNodeRender) {
      defaultSetting = {
        ...defaultSetting,
        ...treeNodeRender(data, searchText, isChecked, isExpanded, isSelected),
      };
    }

    return defaultSetting;
  };

  /**
   * 当前树节点渲染,也应用至搜索树中
   */
  searchTreeNodeRender = (data, _, isChecked, isExpanded, isSelected) => {
    const {
      dataSetting: { dataKey },
    } = this.props;
    const { searchTreeCanOperateKeys } = this.state;

    const defaultSetting = this.treeNodeRender(data, _, isChecked, isExpanded, isSelected);
    defaultSetting.disableCheckbox =
      defaultSetting.disableCheckbox || !searchTreeCanOperateKeys.includes(data[dataKey]);
    return defaultSetting;
  };

  /**
   * 搜索树勾选
   */
  onSearchTreeCheck = (_, currentNode, event) => {
    this.onCheck(currentNode, event);
  };

  /**
   * 搜索树加载节点
   */
  onSearchTreeLoadData = dataKey => {
    const { virtualTree } = this.state;

    this.onExpandFromOuter(virtualTree.getDataByRowKey(dataKey));
  };

  /**
   * 搜索树onSelect
   */
  onSearchTreeSelect = (_, selectedNode, event) => {
    this.onSelect(selectedNode, event);
  };

  /**
   * 树勾选
   */
  onCheck = (checkNode, event) => {
    const {
      checkStrictly,
      dataSetting: { dataKey },
      onCheck,
      checkedKeys: propsCheckedKeys,
    } = this.props;
    const { checkedKeys, halfCheckedKeys, virtualTree } = this.state;
    const currentKey = checkNode[dataKey];

    let newCheckedKeys = [...checkedKeys];
    let newHalfCheckedKeys = halfCheckedKeys;

    // 严格check
    if (checkStrictly) {
      if (newCheckedKeys.includes(currentKey)) {
        newCheckedKeys.splice(newCheckedKeys.indexOf(currentKey), 1);
      } else {
        newCheckedKeys.push(currentKey);
      }
    } else {
      const dealResult = virtualTree.onCheck(currentKey, checkedKeys, halfCheckedKeys);

      newCheckedKeys = dealResult.checkedKeys;
      newHalfCheckedKeys = dealResult.halfCheckedKeys;
    }

    if (!propsCheckedKeys) {
      this.setState(() => {
        return {
          checkedKeys: newCheckedKeys,
          halfCheckedKeys: newHalfCheckedKeys,
        };
      });
    }

    if (onCheck) {
      onCheck(
        {
          checkedKeys: newCheckedKeys,
          halfCheckedKeys: newHalfCheckedKeys,
          checkedRows: virtualTree.getDataByRowKeys(newCheckedKeys),
          halfCheckedRows: virtualTree.getDataByRowKeys(newHalfCheckedKeys),
        },
        checkNode,
        event,
      );
    }
  };

  /**
   * onSelect不触发两次
   */
  onSelect = (checkNode, event) => {
    const {
      onSelect,
      selectedKey,
      dataSetting: { childArrayKey, dataKey },
    } = this.props;
    const { selectedKey: preSelectedKey } = this.state;
    const nowKey = checkNode[dataKey];

    // selectedKey未受控
    if (typeof selectedKey === 'undefined') {
      this.setState(() => {
        return {
          selectedKey: preSelectedKey === nowKey ? '' : nowKey,
        };
      });
    }

    if (onSelect) {
      if (preSelectedKey === nowKey) {
        onSelect(null, { ...checkNode, [childArrayKey]: null }, event);
      } else {
        onSelect(
          { ...checkNode, [childArrayKey]: null },
          { ...checkNode, [childArrayKey]: null },
          event,
        );
      }
    }
  }

  /**
   * 展开/收起
   */
  onExpand = async checkNode => {
    const {
      dataSetting: { dataKey },
      onExpand: onExpandProps,
    } = this.props;
    const { expandedKeys, virtualTree } = this.state;

    const newExpandedKey = new Set(expandedKeys);
    const nowKey = checkNode[dataKey];

    const needLoad = this.needLoadData(checkNode);

    if (expandedKeys.includes(nowKey)) {
      newExpandedKey.delete(nowKey);
    } else {
      newExpandedKey.add(nowKey);

      // 异步加载数据
      if (needLoad) {
        await this.onExpandFromOuter(checkNode);

        // 判断：当前节点无子节点时，自动从expandedKeys中移除
        // 可能问题： loadedKeys外部受控时，可能导致‘看似无法展开其实没数据’的现象
        if (!virtualTree.hasSubs(nowKey)) {
          newExpandedKey.delete(nowKey);
        }
      }
    }

    const resultExpandedKeys = Array.from(newExpandedKey);
    this.setState(() => {
      return {
        expandedKeys: resultExpandedKeys,
      };
    });
    this.getVisibleItem(resultExpandedKeys);

    // expand回调抛出
    if (onExpandProps) {
      onExpandProps(
        virtualTree.filterExpandedKeysForOuter(resultExpandedKeys),
        { expanded: newExpandedKey.has(nowKey), node: checkNode });
    }
  };

  /**
   * 数据外部提供，展开
   */
  onExpandFromOuter = async treeNode => {
    const {
      dataSetting: { loadData, dataKey },
    } = this.props;

    const { virtualTree } = this.state;

    // 当前节点置为加载
    this.setState(pre => {
      return {
        loadingKeys: [...pre.loadingKeys, treeNode[dataKey]],
      };
    });

    try {
      const res = await loadData(treeNode);

      if (!res.isSuccess) {
        console.error('【VirtualizedTree】', treeNode[dataKey], '请求数据失败');
      }

      // 注册child数据
      if (Array.isArray(res.data) && res.data.length > 0) {
        virtualTree.appendData(treeNode, res.data);
      }

      // 当前节点加载完成
      this.setState(pre => {
        const nLKeys = [...pre.loadingKeys];
        nLKeys.splice(pre.loadingKeys.indexOf(treeNode[dataKey]), 1);

        return {
          loadingKeys: [...nLKeys],
        };
      });

      const { onLoadData, checkStrictly } = this.props;
      if (onLoadData) {
        onLoadData(treeNode[dataKey]);
      } else {
        this.setState(pre => {
          return {
            loadedKeys: [...pre.loadedKeys, treeNode[dataKey]],
          };
        });
      }

      const { checkedKeys, halfCheckedKeys, propsCheckedKeys } = this.state;
      if (!checkStrictly && checkedKeys.includes(treeNode[dataKey])) {
        const dealResult = virtualTree.autoCheckSubs(
          treeNode[dataKey],
          checkedKeys,
          halfCheckedKeys,
        );

        const { onCheck } = this.props;

        if (!propsCheckedKeys) {
          this.setState(() => {
            return {
              checkedKeys: dealResult.checkedKeys,
              halfCheckedKeys: dealResult.halfCheckedKeys,
            };
          });
        }

        if (onCheck) {
          onCheck(
            {
              checkedKeys: dealResult.checkedKeys,
              halfCheckedKeys: dealResult.halfCheckedKeys,
              checkedRows: dealResult.checkedRows,
              halfCheckedRows: dealResult.halfCheckedRows,
            },
            treeNode,
          );
        }
      }
    } catch (e) {
      console.error('【VirtualizedTree】loadData返回值错误！', e);
    }
  };

  /**
   * 资源树内容区滚动(scrollbars)
   */
  onContentScroll = input => {
    if (!input) {
      return;
    }

    const { scrollTop } = input;
    this.setState(() => {
      return {
        realScrollTop: scrollTop,
      };
    });
    this.getVisibleItem(null, scrollTop);
  };

  /**
   * 搜索内容,支持外部传入搜索结果
   */
  onSearch = async searchStr => {
    const { onSearch } = this.props;
    const { searchText } = this.state;

    // 重复搜索，不予处理
    if (searchText === searchStr) {
      return;
    }

    let searchResult = null;
    if (onSearch) {
      try {
        const res = await onSearch(searchStr);
        if (res && res.isSuccess) {
          searchResult = {
            data: res.data,
            expandedKeys: res.expandedKeys,
            canOperateKeys: res.canOperateKeys,
          };
        }
      } catch (exception) {
        console.error('onSearch函数无法获取返回值');
      }
    }

    this.setState(pre => {
      if (!searchResult) {
        if (searchStr) {
          searchResult = pre.virtualTree.onSearch(searchStr);
        } else {
          searchResult = { data: [], expandedKeys: [], canOperateKeys: [] };
        }
      }

      return {
        searchText: searchStr,
        searchTreeData: searchResult.data,
        searchTreeExpandedKeys: searchResult.expandedKeys,
        searchTreeCanOperateKeys: searchResult.canOperateKeys,
      };
    });
  };

  /**
   * 【不涉及虚拟树】渲染搜索框
   */
  renderSearcher = () => {
    const {
      hasSearch,
      searchSetting,
      dataSetting: { dataViewKey },
    } = this.props;
    const { searchText, virtualTree } = this.state;
    // const { visibleItems, propsData } = this.state;
    if (!hasSearch) {
      return null;
    }

    // // 当前树还未计算完成
    // let disabledSearcher = false;
    // if (visibleItems.length === 0 && propsData) {
    //   disabledSearcher = true;
    // }

    return (
      <div style={{ height: `${this.getSearcherHeight()}px` }}>
        <Searcher
          onSearch={this.onSearch}
          inputSetting={searchSetting}
          text={searchText}
          liveSearchFunc={virtualTree.onLiveSearch}
          dataViewKey={dataViewKey}
        />
      </div>
    );
  };

  renderNodes = () => {
    const { visibleItems } = this.state;

    return visibleItems.map(item => {
      return (
        <React.Fragment key={`renderTreeNode-${item.treeKey}`}>
          {this.renderNode(item)}
        </React.Fragment>
      );
    });
  };

  renderNode = data => {
    const {
      expandedKeys,
      checkedKeys,
      halfCheckedKeys,
      loadingKeys,
      selectedKey,
      searchText,
    } = this.state;
    const {
      checkable,
      dataSetting: { dataKey },
      dataSetting,
      switcherIcon,
    } = this.props;

    const isChild = hasChild(dataSetting)(data) || this.needLoadData(data);
    const isExpanded = expandedKeys.includes(data[dataKey]);
    const isChecked = checkedKeys.includes(data[dataKey]);
    const isHalfChecked = halfCheckedKeys.includes(data[dataKey]);

    // 异步加载数据
    const isLoading = loadingKeys.includes(data[dataKey]);

    // 是否选中
    const isSelected = selectedKey === data[dataKey];

    // 单行样式
    const defaultSetting = this.treeNodeRender(data, searchText, isChecked, isExpanded, isSelected);

    return (
      <TreeNode
        isChild={isChild}
        isExpanded={isExpanded}
        isChecked={isChecked}
        isHalfChecked={isHalfChecked}
        isLoading={isLoading}
        isSelected={isSelected}
        vTreeNode={data}
        switcherIcon={switcherIcon}
        checkable={checkable}
        onExpand={this.onExpand}
        onCheck={!defaultSetting.disableCheckbox && this.onCheck}
        onSelect={!defaultSetting.disabled && this.onSelect}
        disableCheckbox={defaultSetting.disableCheckbox}
        disabled={defaultSetting.disabled}
      >
        <div className={`${CSS_PREFIX}-tree-content-content`} title={defaultSetting.title}>
          {defaultSetting.icon && (
            <div className={`${CSS_PREFIX}-tree-content-icon`}>{defaultSetting.icon}</div>
          )}
          {defaultSetting.content}
        </div>
      </TreeNode>
    );
  };

  renderSearchTree = () => {
    const { dataSetting, checkable, hasSearch } = this.props;
    const {
      searchText,
      searchTreeData,
      searchTreeExpandedKeys,
      loadedKeys,
      checkedKeys,
      selectedKey,
    } = this.state;

    if (!hasSearch) {
      return null;
    }

    if (!searchText) {
      return null;
    }

    if (searchTreeData.length === 0) {
      return (
        <div className={`${CSS_PREFIX}-tree-search-tree`}>
          <div className={`${CSS_PREFIX}-tree-empty`}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无搜索内容" />
          </div>
        </div>
      );
    }

    return (
      <div className={`${CSS_PREFIX}-tree-search-tree`}>
        <Tree
          dataSetting={dataSetting}
          data={searchTreeData}
          expandedKeys={searchTreeExpandedKeys}
          loadedKeys={loadedKeys}
          checkable={checkable}
          checkedKeys={checkedKeys}
          selectedKey={selectedKey}
          treeNodeRender={this.searchTreeNodeRender}
          onCheck={this.onSearchTreeCheck}
          onLoadData={this.onSearchTreeLoadData}
          onSelect={this.onSearchTreeSelect}
        />
      </div>
    );
  };

  // 设置滚动条的样式
  renderThumb = ({ style, ...props }) => {
    const { scrollBarSetting = {} } = this.props;

    const { width: scrollWdith, height: scrollHeight, backgroundColor: scrollBg } = scrollBarSetting || {};

    let thumbStyle = {};
    if (scrollBarSetting && scrollBarSetting.renedrScrollBarStyle && Object.keys(scrollBarSetting.renedrScrollBarStyle).length > 0) {
      thumbStyle = scrollBarSetting.renedrScrollBarStyle
    } else {
      thumbStyle = {
        width: scrollWdith || '6px',
        height: scrollHeight || '6px',
        backgroundColor: scrollBg || 'rgba(0, 0, 0, 0.2)',
        borderRadius: '6px',
      };
    }

    return (
      <div
        style={{ ...style, ...thumbStyle }}
        {...props} />
    );
  }


  renderNormalTree = () => {
    const { itemScrollTop, itemHeight, visibleItems, searchText } = this.state;

    if (visibleItems.length === 0) {
      return (
        <div
          style={{ display: searchText ? 'none' : 'block' }}
          className={`${CSS_PREFIX}-tree-empty`}
        >
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      );
    }

    return (
      // <div>

      // </div>
      <Scrollbar
        style={{ height: '100%', display: searchText ? 'none' : 'block' }}
        onScrollFrame={throttle(this.onContentScroll, 50)}
        ref={r => {
          this.scrollBarElem = r;
        }}
        hideTracksWhenNotNeeded
        universal
        renderThumbVertical={this.renderThumb}
        renderThumbHorizontal={this.renderThumb}
      >
        <div style={{ height: `${itemHeight * STATICS.ROW_HEIGHT}px` }} />
        <div style={{ position: 'absolute', top: itemScrollTop }}>{this.renderNodes()}</div>
      </Scrollbar>
    );
  };

  render() {
    return (
      <React.Fragment>
        {this.renderSearcher()}
        <div
          className={`${CSS_PREFIX}-tree`}
          style={{ height: `calc(100% - ${this.getSearcherHeight()}px)` }}
          ref={r => {
            this.treeElem = r;
          }}
        >
          {this.renderNormalTree()}
          {this.renderSearchTree()}
        </div>
      </React.Fragment>
    );
  }
}

Tree.propTypes = {
  data: PropTypes.array.isRequired,
  dataSetting: PropTypes.shape({
    dataKey: PropTypes.string.isRequired,
    dataViewKey: PropTypes.string.isRequired,
    childArrayKey: PropTypes.string.isRequired,
    treeKeySplit: PropTypes.string,
    hasChild: PropTypes.func,
    loadData: PropTypes.func,
    needLoadData: PropTypes.func,
  }),
  viewSetting: PropTypes.shape({
    treeHeight: PropTypes.number,
  }),
  checkable: PropTypes.bool,
  defaultCheckedKeys: PropTypes.array,
  defaultExpandedKeys: PropTypes.array,
  defaultSelectedKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  expandedKeys: PropTypes.array,
  checkedKeys: PropTypes.array,
  disabledKeys: PropTypes.array,
  onCheck: PropTypes.func,
  hasSearch: PropTypes.bool,
  searchSetting: PropTypes.shape({
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(['small', 'default', 'large']),
    disabled: PropTypes.bool,
    onLiveSearchClick: PropTypes.func,
  }),
  onSearch: PropTypes.func,
  treeNodeRender: PropTypes.func,
  onLoadData: PropTypes.func,
  loadedKeys: PropTypes.array,
  onSelect: PropTypes.func,
  selectedKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  switcherIcon: PropTypes.element,
  checkStrictly: PropTypes.bool,
  onExpand: PropTypes.func,
  scrollBarSetting: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
    backgroundColor: PropTypes.string,
    renedrScrollBarStyle: PropTypes.object,
  }),
};

Tree.defaultProps = DEFAULT_PROPS;

export default Tree;
