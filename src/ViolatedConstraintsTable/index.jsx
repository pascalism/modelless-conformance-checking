import {
  AnalyticalTable,
  MultiComboBox,
  MultiComboBoxItem,
  Button,
  Select,
  Option,
} from '@ui5/webcomponents-react';
import { CONSTRAINT_LEVELS, RELEVANCE_LEVELS, filterFn } from '../util';
import { without, isNil } from 'lodash';
import { useState } from 'react';

const ViolatedConstraintsTable = ({
  onRowSelect,
  deleteSelected,
  markNavigatedOutputRow,
  setSelectedOutputRows,
  setResultData,
  resultData,
  selectedOutputRows,
}) => {
  const [relevanceScoreFilter, setRelevanceScoreFilter] = useState('0.5');

  return !isNil(resultData) ? (
    <>
      <AnalyticalTable
        minRows={9}
        visibleRows={9}
        markNavigatedRow={markNavigatedOutputRow}
        groupable
        scaleWidthMode="Smart"
        filterable
        selectionMode="MultiSelect"
        onRowSelect={(e) => onRowSelect(e, setSelectedOutputRows)}
        columns={[
          {
            Header: 'Relevance',
            accessor: 'relevance_score',
            width: 50,
            headerTooltip: 'relevance_score',
            disableGroupBy: true,
            defaultCanSort: true,
            filter: (rows, accessor, filterValue) => {
              setResultData(
                resultData.filter((x) => x.relevance_score >= filterValue)
              );
              return rows.filter((row) => row.values[accessor] >= filterValue);
            },
            Filter: ({ column, popoverRef }) => {
              const handleChange = (event) => {
                // set filter
                column.setFilter(
                  event.detail.selectedOption.innerText.slice(1)
                );
                setRelevanceScoreFilter(
                  event.detail.selectedOption.innerText.slice(1)
                );
                // close popover
                popoverRef.current.close();
              };

              return (
                <Select onChange={handleChange} style={{ width: '100%' }}>
                  {RELEVANCE_LEVELS.map(({ text, value }) => {
                    return (
                      <Option
                        key={value}
                        selected={value === relevanceScoreFilter}
                      >
                        {text}
                      </Option>
                    );
                  })}
                </Select>
              );
            },
          },
          {
            Header: () => <span>Level</span>,
            selectionMode: 'SingleSelect',
            filter: filterFn,
            accessor: 'Level',
            width: 100,
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
            Header: 'Object',
            accessor: 'Object',
            headerTooltip: 'Concerning Object',
            width: 100,
          },
          {
            Header: 'Natural Language',
            accessor: 'nat_lang_template',
            headerTooltip: 'nat_lang_template',
          },
          {
            Header: 'Kind',
            accessor: 'template',
            headerTooltip: 'template',
            width: 100,
          },
          {
            Header: '# occurred',
            accessor: 'num_violations',
            headerTooltip: 'num_violations',
            width: 60,
          },
          {
            Cell: (instance) => {
              const { row, webComponentsReactProperties } = instance;
              // disable buttons if overlay is active to prevent focus
              const isOverlay = webComponentsReactProperties.showOverlay;
              const onDelete = () => {
                const rows = row.original
                  ? [row.original]
                  : row.leafRows.map((x) => x.original);

                setResultData(without(resultData, ...rows));
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
        data={resultData}
      />
      <Button
        icon="delete"
        onClick={() =>
          deleteSelected(resultData, selectedOutputRows, setResultData)
        }
      >
        Delete Selected
      </Button>
    </>
  ) : null;
};
export default ViolatedConstraintsTable;
