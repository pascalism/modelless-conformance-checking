import { isNil, isEmpty } from 'lodash';

const tooltip =
  (locale) =>
  ({ name, value, data }) => {
    let displayName;
    if (isEmpty(name)) {
      displayName = 'Σ';
    } else if (isNil(name)) {
      displayName = '-';
    } else {
      displayName = name;
    }
    const displayValue = isNil(value) ? '-' : value.toLocaleString(locale);

    return `${displayName}: ${displayValue}; <br />${
      data.reason ? data.reason.map((x) => x.reason).join('<br />') : ''
    }`;
  };

export default ({ data = [], noAnimation, setRightClickInfo }) => ({
  animation: !noAnimation,
  legend: {
    data: ['conformant'],
    left: 10,
  },
  tooltip: {
    show: true,
    confine: true,
    formatter: tooltip('en-US', setRightClickInfo),
  },
  series: {
    type: 'sunburst',
    data,
    radius: ['20%', '95%'],
    label: {
      rotate: 'tangential',
    },
  },
});
