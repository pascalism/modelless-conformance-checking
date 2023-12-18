import { AnalyticalTable, Button } from '@ui5/webcomponents-react';

import { isNil } from 'lodash';

// TODO: DELETE ALL, DELETE
const UnmappedConstraintsTable = ({
  onRowSelect,
  markNavigatedOutputRow,
  setSelectedOutputRows,
  setResultData,
  resultData,
  unmappedData,
  //   selectedOutputRows,
}) => {
  return !isNil(unmappedData) ? (
    <>
      <AnalyticalTable
        minRows={9}
        maxRows={10}
        markNavigatedRow={markNavigatedOutputRow}
        groupable
        scaleWidthMode="Smart"
        filterable
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
            Header: '# occurred',
            accessor: 'num_violations',
            headerTooltip: 'num_violations',
          },
        ]}
        data={unmappedData}
      />
    </>
  ) : null;
};
export default UnmappedConstraintsTable;
