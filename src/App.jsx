/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from 'react';
import {
  // Select,
  // Option,
  AnalyticalTable,
  MultiComboBox,
  MultiComboBoxItem,
  Button,
} from '@ui5/webcomponents-react';
// TODO Change this
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import { CONSTRAINT_LEVELS, makeCompressedMaps } from './util';
import { without } from 'lodash';

const filterFn = (rows, accessor, filterValue) => {
  if (filterValue.length > 0) {
    return rows.filter((row) => {
      const rowVal = row.values[accessor];
      if (filterValue.some((item) => rowVal.includes(item))) {
        return true;
      }
      return false;
    });
  }
  return rows;
};

const ConformanceCheckingSection = () => {
  const [constraintData, setConstraintData] = useState();

  const [selectedRows, setSelectedRows] = useState([]);

  const onRowSelect = (e) => {
    const rows = e.detail.selectedFlatRows.map((x) => x.original);
    setSelectedRows(rows);
  };

  useEffect(() => {
    makeCompressedMaps().then((result) =>
      setConstraintData(
        result.map((row) => ({
          ...row,
          nat_lang_template: row.nat_lang_template
            .replace('{1}', `"${row.left_op}"`)
            .replace('{2}', `"${row.right_op}"`)
            .replace('{n}', row.constraint_string?.split('[')[0]?.slice(-1)),
        }))
      )
    );
  }, []);

  const markNavigatedRow = useCallback(
    (row) => {
      return selectedRows?.find((x) => x.id === row.id);
    },
    [selectedRows]
  );

  const deleteSelected = () =>
    setConstraintData(without(constraintData, ...selectedRows));

  return (
    <>
      {constraintData ? (
        <AnalyticalTable
          markNavigatedRow={markNavigatedRow}
          groupable
          scaleWidthMode="Grow"
          selectionMode="MultiSelect"
          onRowSelect={(e) => onRowSelect(e)}
          filterable
          columns={[
            {
              Header: () => <span>Level</span>,
              selectionMode: 'SingleSelect',
              filter: filterFn,
              accessor: 'Level',
              headerTooltip: 'Level of the Constraint',
              disableFilters: false,
              disableGroupBy: true,
              disableSortBy: false,
              Filter: ({ column, popoverRef }) => {
                const handleChange = (event) => {
                  column.setFilter(
                    event.detail.items.map((item) => item.getAttribute('text'))
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
                      const isSelected = column?.filterValue?.some(
                        (filterVal) => filterVal.includes(value)
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
                const { cell, row, webComponentsReactProperties } = instance;
                // disable buttons if overlay is active to prevent focus
                const isOverlay = webComponentsReactProperties.showOverlay;
                // console.log('This is your row data', row.original);
                const onDelete = () => {
                  console.log('delete', cell, row);
                  setConstraintData(without(constraintData, row.original));
                };
                return (
                  <Button
                    icon="delete"
                    disabled={isOverlay}
                    onClick={onDelete}
                  />
                );
              },
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
      ) : null}
      <Button icon="delete" onClick={deleteSelected}>
        Delete Selected
      </Button>
    </>
  );
};

export default ConformanceCheckingSection;
