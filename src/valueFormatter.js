/* eslint-disable no-param-reassign */
import { find } from 'lodash';

export default ({ data, chartColors = [] }) => {
  const measurePosition = 15;
  const tree = rowsToTree({ rowData: data, measurePosition, chartColors });

  return { data: tree };
};

const rowsToTree = ({ rowData, chartColors = [] }) =>
  rowData.reduce((tree, currentRow, j) => {
    const dimension = currentRow.slice(0, currentRow.length - 1);

    const measure = currentRow[currentRow.length - 1];

    dimension.reduce(addSingleRowToTree(dimension.length, measure, j), {
      parentChildren: tree,
      chartColors,
    });
    return tree;
  }, []);

const addSingleRowToTree =
  (length, measure) =>
  ({ parentChildren }, name, i) => {
    const node = find(parentChildren, { name });

    if (node) {
      return {
        parentChildren: node.children,
        color: '#FF0000',
        depth: node.depth,
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
          color: '#FF0000',
        },
      });
    } else {
      parentChildren.push({
        name,
        children,
        depth: i,
        itemStyle: {
          color: '#FF0000',
        },
      });
    }
    return { parentChildren: children, color: '#FF0000', depth: i };
  };
