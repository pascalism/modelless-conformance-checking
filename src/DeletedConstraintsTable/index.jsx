import { AnalyticalTable, Button } from '@ui5/webcomponents-react';

import { isNil } from 'lodash';

const DeletedConstraintsTable = ({
  onRowSelect,
  markNavigatedOutputRow,
  setSelectedOutputRows,
  setResultData,
  resultData,
  diffData,
//   selectedOutputRows,
}) => {
  return !isNil(diffData) ? (
    <>
      <AnalyticalTable
        minRows={9}
        maxRows={10}
        markNavigatedRow={markNavigatedOutputRow}
        groupable
        scaleWidthMode="Smart"
        filterable
        selectionMode="MultiSelect"
        onRowSelect={(e) => onRowSelect(e, setSelectedOutputRows)}
        visibleRows="10"
        columns={[
          {
            Header: 'Relevance Score',
            accessor: 'relevance_score',
            headerTooltip: 'relevance_score',
            disableGroupBy: true,
            defaultCanSort: true,
          },
          {
            Header: () => <span>Level</span>,
            selectionMode: 'SingleSelect',
            accessor: 'Level',
            headerTooltip: 'Level of the Constraint',
            disableFilters: false,
            disableGroupBy: false,
            disableSortBy: false,
          },
          {
            Header: 'Concerning Event',
            accessor: 'left_op',
            headerTooltip: 'left_op of the Constraint',
          },
          {
            Header: 'Natural Language',
            accessor: 'nat_lang_template',
            headerTooltip: 'nat_lang_template',
            width: 500,
          },
          {
            Header: 'Kind',
            accessor: 'template',
            headerTooltip: 'template',
          },
          {
            Header: 'times this violation occurred',
            accessor: 'num_violations',
            headerTooltip: 'num_violations',
          },
          {
            Cell: (instance) => {
              const { row, webComponentsReactProperties } = instance;
              // disable buttons if overlay is active to prevent focus
              const isOverlay = webComponentsReactProperties.showOverlay;
              // console.log('This is your row data', row.original);
              const onDelete = () => {
                const rows = row.original
                  ? [row.original]
                  : row.leafRows.map((x) => x.original);
                setResultData([...resultData, ...rows]);
              };
              return (
                <Button icon="add" disabled={isOverlay} onClick={onDelete} />
              );
            },
            width: 50,
            Header: '',
            accessor: '.',
            disableFilters: true,
            disableGroupBy: true,
            disableResizing: true,
            disableSortBy: true,
            id: 'actions',
          },
        ]}
        data={diffData}
      />
    </>
  ) : null;
};
export default DeletedConstraintsTable;
