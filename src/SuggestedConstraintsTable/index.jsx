import {
  AnalyticalTable,
  MultiComboBox,
  MultiComboBoxItem,
  Button,
} from '@ui5/webcomponents-react';
import { CONSTRAINT_LEVELS, filterFn } from '../util';
import { without } from 'lodash';

const SuggestedConstraintsTable = ({
  markNavigatedInputRow,
  setSelectedInputRows,
  setConstraintData,
  constraintData,
  selectedInputRows,
  onRowSelect,
  deleteSelected,
}) => {
  return (
    <>
      <AnalyticalTable
        minRows={9}
        maxRows={10}
        markNavigatedRow={markNavigatedInputRow}
        groupable
        scaleWidthMode="Smart"
        selectionMode="MultiSelect"
        onRowSelect={(e) => onRowSelect(e, setSelectedInputRows)}
        filterable
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
            filter: filterFn,
            accessor: 'Level',
            headerTooltip: 'Level of the Constraint',
            disableFilters: false,
            disableGroupBy: false,
            disableSortBy: false,
            Filter: ({ column, popoverRef }) => {
              const handleChange = (event) => {
                column.setFilter(
                  event.detail.items.map((item) => item?.getAttribute('text'))
                );
                popoverRef.current.close();
              };
              return (
                <MultiComboBox
                  accessibleName="Constraint Level"
                  label="Constraint Level"
                  onSelectionChange={handleChange}
                >
                  {CONSTRAINT_LEVELS.map(({ text, value }) => {
                    const isSelected = column?.filterValue?.some((filterVal) =>
                      filterVal.includes(value)
                    );
                    return (
                      <MultiComboBoxItem
                        text={text}
                        key={value}
                        selected={isSelected}
                      />
                    );
                  })}
                </MultiComboBox>
              );
            },
          },
          {
            Header: 'Concerning Event',
            accessor: 'left_op',
            headerTooltip: 'left_op of the Constraint',
          },
          {
            Header: 'Model Names',
            accessor: 'model_name',
            headerTooltip: 'model_id of the Constraint',
          },
          {
            Header: 'Natural Language',
            accessor: 'nat_lang_template',
            headerTooltip: 'nat_lang_template',
            width: 500,
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

                setConstraintData(without(constraintData, ...rows));
              };
              return (
                <Button icon="delete" disabled={isOverlay} onClick={onDelete} />
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
        data={constraintData}
      />

      <Button
        icon="delete"
        onClick={() =>
          deleteSelected(constraintData, selectedInputRows, setConstraintData)
        }
      >
        Delete Selected
      </Button>
    </>
  );
};
export default SuggestedConstraintsTable;
