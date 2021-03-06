import React from 'react';
import PropTypes from 'prop-types';

import style from 'PVWStyle/ReactProperties/CellProperty.mcss';

import convert from '../../../Common/Misc/Convert';
import validate from '../../../Common/Misc/Validate';

export default class InputCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      valueRep: props.value,
    };

    // Callback binding
    this.getTooltip = this.getTooltip.bind(this);
    this.applyDomains = this.applyDomains.bind(this);
    this.valueChange = this.valueChange.bind(this);
    this.endEditing = this.endEditing.bind(this);
  }

  getTooltip() {
    let tooltip = '';
    const idx = this.props.idx;

    if (!this.props.domain) {
      return tooltip;
    }

    // Handle range
    if (
      {}.hasOwnProperty.call(this.props.domain, 'range') &&
      this.props.domain.range.length
    ) {
      const size = this.props.domain.range.length;
      const { min, max } = this.props.domain.range[idx % size] || {};

      tooltip += min !== undefined ? `min(${min}) ` : '';
      tooltip += max !== undefined ? `max(${max}) ` : '';
    }

    return tooltip;
  }

  applyDomains(idx, val) {
    if (!this.props.domain) {
      return val;
    }

    // Handle range
    let newValue = val;
    if (
      {}.hasOwnProperty.call(this.props.domain, 'range') &&
      this.props.domain.range.length
    ) {
      const size = this.props.domain.range.length;
      const { min, max, force } = this.props.domain.range[idx % size];
      if (force) {
        newValue = min !== undefined ? Math.max(min, newValue) : newValue;
        newValue = max !== undefined ? Math.min(max, newValue) : newValue;
      }
    }
    return newValue;
  }

  valueChange(e) {
    const newVal = e.target.value;
    const isValid = validate[this.props.type](newVal);
    this.setState({
      editing: true,
      valueRep: newVal,
    });

    if (!this.props.noEmpty && newVal.length === 0 && !isValid) {
      this.props.onChange(this.props.idx, undefined);
    } else if (isValid) {
      let propVal = convert[this.props.type](newVal);
      propVal = this.applyDomains(this.props.idx, propVal);
      this.props.onChange(this.props.idx, propVal);
    }
  }

  endEditing() {
    this.setState({
      editing: false,
    });
  }

  render() {
    return (
      <td className={style.inputCell}>
        <label className={style.inputCellLabel}>{this.props.label}</label>
        <input
          readOnly={this.props.domain && this.props.domain.readOnly}
          className={style.inputCellInput}
          value={this.state.editing ? this.state.valueRep : this.props.value}
          onChange={this.valueChange}
          title={this.getTooltip()}
          onBlur={this.endEditing}
        />
      </td>
    );
  }
}

InputCell.propTypes = {
  domain: PropTypes.object.isRequired,
  idx: PropTypes.number,
  label: PropTypes.string,
  noEmpty: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  value: PropTypes.any,
};

InputCell.defaultProps = {
  label: '',
  idx: 0,
  value: '',
  type: 'string',
  noEmpty: false,
};
