import { isNil, isEmpty } from 'lodash';

const tooltip =
  (locale) =>
  ({ name, value }) => {
    let displayName;
    if (isEmpty(name)) {
      displayName = 'Σ';
    } else if (isNil(name)) {
      displayName = '-';
    } else {
      displayName = name;
    }
    const displayValue = isNil(value) ? '-' : value.toLocaleString(locale);
    return `${displayName}: ${displayValue}`;
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
