### 2019-12-23

※名称 VirtualizedTree 变更为 Tree

fix:组件高度计算修复：parentNode.clientHeight 变更为 parentNode.clientHeight - (parentNode.style.paddingTop + parentNode.style.paddingBottom)

### 2019-12-25

feat:组件添加 getTreeDataByDataKey(key: string)函数供外部 ref 调用

### 2019-12-30

fix: scrollbars 添加 universal 属性

feat: 新增 index.mdx

### 2020-01-09

refactor: utils 修改、目录结构修改

feat: API getTreeData 变更为 getListData

      API 新增 getTree(keys) => [] 获取树形结构数据

feat: Props 新增 expandedKeys 参数、checkStrictly 参数

fix: Props onCheck(checkedObj) => onCheck(checkedObj, currentNode)

### 2020-01-10

feat: API getTreeDataByDataKey 变更为 getDataByDataKey

fix: 修复树数据变化 checkedKeys、halfCheckedKeys 不同步更新的 bug

feat: 修改 readme

fix: 修复组件数值型字符串导致排序异常的问题

### 2020-01-14

fix: 修复 getTree 函数单一节点无法展示的 bug

feat: getTree(dataKeys) => getTree(dataKeys, needParent = false)

### 2020-01-15

feat: 新增 API isInSubTree(key1, key2) => 判断以 key2 为主键的节点是否在 key1 为主键的节点的子树中

fix: disabled 去除对 onExpand 的限制，即展开不再受限

fix: 修复 Searcher 搜索内容不清空的 bug

### 2020-01-20

fix: 搜索框使用 hz 图标

fix: 移除 package.json

### 2020-01-21

fix: 修改 treeKey 分割符 - => ^

### 2020-01-22

fix: 修复[dataKey]为 0 无法展示树的 bug; [dataKey]为任何意义上的空将无法正常使用 Tree 组件

fix: 固定数据[dataKey]类型统一，加快计算

fix: 添加搜索图标 title

fix: inner 调整 VirtualTree onCheck

### 2020-02-07

fix: 修复 treeNodeRender 触发的 onCheck 类型校验 warning

fix: 修复 checkStrictly onCheck 回调无响应的 bug

fix: 修复 checkStrictly 下 getTree 返回值

fix: 修复 checkStrictly 下禁用框被级联勾选的 bug

### 2020-02-12

fix: 收起/展开样式修复

fix：markData 属性判断逻辑修复

### 2020-02-18

fix: 修复 onSelect 回调函数取消选中时依然有返回值的 bug

### 2020-02-19

feat: 添加 API resize(), 触发渲染，调整高度。

### 2020-03-01

fix: 修改 API getListData() => getListData(keyArr[] = null) 获取列表数据；传入则获取传入列表，不传获取所有节点列表

### 2020-03-12

feat: 新增 disabledKeys 传入禁用 key, 达到 treeNodeRender disabled disableCheckbox 的效果；但当 treeNodeRender 定义了 disabled 或 disableCheckbox 时，disabledKeys 无效

fix: 修改 props onSelect(selectedNode) => onSelect(selectedNode, targetNode) targetNode 传出点击区域的节点数据，selectedNode 传出选中区域的节点数据。

fix: 修改搜索树交互=》未精确匹配的父级节点禁止勾选

### 2020-03-19

fix: 修改异步加载存储节点，使子节点异步加载后依旧存在展开/收起图标

### 2020-03-22

fix: 搜索树添加 onSelect 监听，与原树方法/参数绑定

### 2020-03-24

feat: 添加 API clearSearchState()，清空树搜索状态

fix: 修复勾选 bug

fix: 修复 Tree selectedKey 外部传入''无法同步的 bug

### 2020-04-08

feat: onSelect => onSelect(选中节点,目标节点) => onSelect(选中节点,目标节点,目标 event)

feat: onCheck => onCheck(定制内容,目标节点) => onCheck(定制内容,目标节点, 目标 event)

### 2020-04-23

feat: 添加 AutoComplete 功能，输入字符时进行实时搜索，数据限制 200 条，避免卡死（后续要优化成虚拟列表的形式）

### 2020-04-24

feat: 修复 AutoComplete 输入时，value 重复，滚动混乱，样式问题，显示第 x 层等问题。

feat: 添加选中输入内容后，树选中的效果，暴露 onLiveSearchClick 方法。

feat: 修复搜索后，第一次 没有禁止父级复选框问题。

### 2020-05-21

feat: 修复 searchSetting不能传placeholder的问题。

feat: 新增 onExpand 回调,返回展开节点的信息。

feat: 优化展开逻辑，对没有子节点的异步树进行处理。

### 2020-05-22

feat: 修复 Empty渲染两次的问题，新增onSelect双击不生效。

### 2020-06-12

feat: 新增滚动条设置宽高和颜色以及自定义样式。


