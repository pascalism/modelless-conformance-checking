/* eslint-disable no-param-reassign */
import { find } from 'lodash';

export default ({ data, chartColors = [] }) => {
  const tree = rowsToTree({ rowData: data, chartColors });

  return { data: tree };
};

const rowsToTree = ({ rowData, chartColors = [] }) =>
  rowData.reduce((tree, currentRow, j) => {
    const dimension = currentRow.events;

    const info = currentRow;

    dimension.reduce(addSingleRowToTree(dimension.length, info, j), {
      parentChildren: tree,
      chartColors,
    });
    return tree;
  }, []);

const addSingleRowToTree =
  (length, { isFaulty, measure, faultyEventsFromVariant }) =>
  ({ parentChildren }, name, i) => {
    const node = find(parentChildren, { name });
    let color;
    const event = faultyEventsFromVariant.find((x) => x.faultyEvent === name);
    let reason;
    if (event) {
      color = event?.level === 'faulty' ? '#FF0000' : ' #FFBF00';
      reason = event?.reason;
    } else {
      color = isFaulty ? '#FFFF00' : '#008000';
    }
    if (node) {
      return {
        parentChildren: node.children,
        color: color,
        depth: node.depth,
        reason: reason,
      };
    }

    const children = [];

    const isLeaf = i === length - 1;

    if (isLeaf) {
      parentChildren.push({
        name,
        value: measure,
        depth: i,
        itemStyle: {
          color: color,
        },
        reason: reason,
      });
    } else {
      parentChildren.push({
        name,
        children,
        depth: i,
        itemStyle: {
          color: color,
        },
        reason: reason,
      });
    }
    return { parentChildren: children, color: color, depth: i };
  };
