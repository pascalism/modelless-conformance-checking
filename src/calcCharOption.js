import { isNil, isEmpty } from 'lodash';

const tooltip =
  (locale, setRightClickInfo) =>
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

    setRightClickInfo(data.reason);
    return `${displayName}: ${displayValue}; <br />${
      data.reason ? data.reason : ''
    }`;
  };

export default ({ data = [], noAnimation, setRightClickInfo }) => ({
  animation: !noAnimation,
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
