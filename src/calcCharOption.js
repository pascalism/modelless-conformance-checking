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
    return `${displayName}: ${displayValue}; ${data.reason ? data.reason : ''}`;
  };

export default ({ data = [], noAnimation }) => ({
  animation: !noAnimation,
  tooltip: {
    show: true,
    formatter: tooltip('en-US'),
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
