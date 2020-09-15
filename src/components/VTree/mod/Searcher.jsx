import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, message, Icon, AutoComplete } from 'antd';
import { STATICS } from '../constant';
import styles from '../style/index.less';
import { guid } from '../utils/utils';

const { Option } = AutoComplete;

/**
 * 搜索框
 * @param onSearch 确认搜索
 * @param inputSetting Input.Search其余设置
 * @param disabled 禁用
 * @param text 外部text， 不一致时清空
 */
class Searcher extends PureComponent {
  autoCompleteSplit = 'QaQ';

  static propTypes = {
    liveSearchFunc: PropTypes.func,
    dataViewKey: PropTypes.string,
    onSearch: PropTypes.func,
    inputSetting: PropTypes.shape({
      placeholder: PropTypes.string,
      size: PropTypes.oneOf(['small', 'default', 'large']),
      disabled: PropTypes.bool,
      onLiveSearchClick: PropTypes.func,
    }),
    disabled: PropTypes.bool,
    text: PropTypes.string,
  };

  static defaultProps = {
    inputSetting: {
      size: 'default',
      onLiveSearchClick: () => { },
    },
  };

  static getDerivedStateFromProps(nextProps, state) {
    if (nextProps.text !== state.outerText) {
      return {
        value: nextProps.text,
        outerText: nextProps.text,
        dataSource: [],
      };
    }
    return null;
  }

  state = {
    value: '',
    outerText: '',
    dataSource: [],
  };

  componentWillUnmount() {
    this.setState = () => { };
  }

  onChange = value => {
    // filter auto complete select
    if (value && value.includes(this.autoCompleteSplit)) {
      return;
    }

    // no value
    if (!value) {
      const { onSearch } = this.props;
      if (onSearch) {
        onSearch('');
      }

      this.setState({
        dataSource: [],
        value: '',
      });
      return;
    }

    this.setState({
      value,
    });

    const { liveSearchFunc } = this.props;
    if (liveSearchFunc) {
      const liveSearchData = liveSearchFunc(value).searchSelectData;

      const resolveData =
        Array(liveSearchData) && liveSearchData.length > 0 ? liveSearchData.slice(0, 200) : [];

      this.setState({
        dataSource: resolveData,
      });
    }
  };

  onHandleSearch = (input = null) => {
    const { value: stateValue } = this.state;

    let value = input;
    if (typeof input !== 'string') {
      value = stateValue;
    }

    const { onSearch } = this.props;

    if (!value) {
      message.warning('搜索内容不能为空!');
      return;
    }

    if (value.length < STATICS.SEARCH_CHAR_LIMIT) {
      message.warning(`请输入至少${STATICS.SEARCH_CHAR_LIMIT}个字符!`);
      return;
    }

    if (onSearch) {
      onSearch(value);
    }
  };

  onAutoCompleteSelect = (value, option) => {
    if (!value) {
      return;
    }

    // 回调抛出精确匹配节点
    const {
      inputSetting: { onLiveSearchClick },
    } = this.props;
    const {
      props: { item },
    } = option;
    if (onLiveSearchClick) {
      onLiveSearchClick(item);
    }

    const realValue = value.substring(0, value.lastIndexOf(this.autoCompleteSplit));
    this.setState(
      {
        value: realValue,
      },
      () => {
        this.onHandleSearch(realValue);
      },
    );
  };

  getOptions = () => {
    const { dataSource } = this.state;
    const { dataViewKey } = this.props;

    if (!Array.isArray(dataSource) || dataSource.length === 0) {
      return [];
    }

    return dataSource.map(item => {
      return (
        <Option
          key={guid()}
          value={`${item[dataViewKey]}${this.autoCompleteSplit}第${item.layer}层数据`}
          item={item}
          title={item[dataViewKey]}
        >
          {item[dataViewKey]}
        </Option>
      );
    });
  };

  render() {
    const { inputSetting, disabled } = this.props;
    const { placeholder } = inputSetting || {};
    const { value } = this.state;

    return (
      <div className={styles['auto-complete-content']}>
        <AutoComplete
          dataSource={this.getOptions()}
          onChange={this.onChange}
          onSelect={this.onAutoCompleteSelect}
          value={value}
        >
          <Input
            placeholder={placeholder}
            allowClear
            disabled={disabled}
            {...inputSetting}
            suffix={
              <Icon type="search" theme="outlined" onClick={this.onHandleSearch} title="搜索" />
            }
          />
        </AutoComplete>
      </div>
    );
  }
}

export default Searcher;
