/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from 'react';
import {
  // Select,
  // Option,
  AnalyticalTable,
  MultiComboBox,
  MultiComboBoxItem,
  Button,
  Popover,
  Label,
} from '@ui5/webcomponents-react';
// TODO Change this
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import { createUseStyles } from 'react-jss';
import { CONSTRAINT_LEVELS, makeCompressedMaps } from './util';
import { flatten, isEmpty, uniq, without } from 'lodash';
import styles from './styles';
const useStyles = createUseStyles(styles);

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

const ConformanceCheckingSection = ({ constraints = [] }) => {
  const classes = useStyles();

  const [constraintLevel, setConstraintLevel] = useState('');
  const [constraintData, setConstraintData] = useState();
  const [events, setEvents] = useState([]);
  const [objects, setObjects] = useState([]);
  const [object, setObject] = useState();
  const [origins, setOrigins] = useState([]);
  const [event, setEvent] = useState();
  const [origin, setOrigin] = useState();

  const [selectedRow, setSelectedRow] = useState();
  const onRowSelect = (e) => {
    setSelectedRow(e.detail.row);
  };
  const markNavigatedRow = useCallback(
    (row) => {
      return selectedRow?.id === row.id;
    },
    [selectedRow]
  );

  useEffect(() => {
    makeCompressedMaps().then((results) => {
      setConstraintData(results);
      setEvents(
        uniq([
          ...results
            .map((result) => result.left_op)
            .filter((event) => !isEmpty(event)),
          ...results
            .map((result) => result.right_op)
            .filter((event) => !isEmpty(event)),
        ])
      );

      const models = results.map(({ model_name }) => [
        ...model_name.split(' | ').filter((model) => !isEmpty(model)),
      ]);

      setOrigins(uniq(flatten(models)));

      setObjects(uniq(results.map(({ Object }) => Object)));
    });
  }, []);

  return (
    <div className={classes.Container}>
      <div className={classes.CardWrapper}>
        {constraintData ? (
          <AnalyticalTable
            markNavigatedRow={markNavigatedRow}
            groupable
            reactTableOptions={{
              filterTypes: {
                multiValueFilter: filterFn,
              },
            }}
            selectedRowIds={{
              3: true,
            }}
            onRowSelect={(value) => {
              onRowSelect(value) || console.log(value) || (
                <Popover
                  className="footerPartNoPadding"
                  headerText="Popover Header"
                  horizontalAlign="Center"
                  onAfterClose={function ka() {}}
                  onAfterOpen={function ka() {}}
                  onBeforeClose={function ka() {}}
                  onBeforeOpen={function ka() {}}
                  opener="openPopoverBtn"
                  placementType="Right"
                  verticalAlign="Center"
                >
                  <Label>
                    Press Escape or click outside to close the Popover
                  </Label>
                </Popover>
              );
            }}
            onRowClick={(value) => {
              console.log(value) || (
                <Popover
                  className="footerPartNoPadding"
                  headerText="Popover Header"
                  horizontalAlign="Center"
                  onAfterClose={function ka() {}}
                  onAfterOpen={function ka() {}}
                  onBeforeClose={function ka() {}}
                  onBeforeOpen={function ka() {}}
                  opener="openPopoverBtn"
                  placementType="Right"
                  verticalAlign="Center"
                >
                  <Label>
                    Press Escape or click outside to close the Popover
                  </Label>
                </Popover>
              );
            }}
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
                      event.detail.items.map((item) =>
                        item.getAttribute('text')
                      )
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
                width: 100,
              },
            ]}
            data={constraintData?.slice(0)}
          />
        ) : null}
        <div className={classes.CardTitle}></div>
        <div className={classes.VariantWrapper}>
          <div className={classes.Variants}>
            <div className={classes.Variants}>
              {!isEmpty(constraints) &&
                constraints.map((value) => (
                  <div key={value.id} className={classes.LoopActivitySequence}>
                    <MultiComboBox
                      className={classes.Probability}
                      accessibleName="Constraint Level"
                      label="Constraint Level"
                      value={constraintLevel}
                      onChange={setConstraintLevel}
                    >
                      {CONSTRAINT_LEVELS.map(({ text, value }) => (
                        <MultiComboBoxItem
                          key={value}
                          text={value}
                          value={value}
                        >
                          {text}
                        </MultiComboBoxItem>
                      ))}
                    </MultiComboBox>
                    <p />
                    {!isEmpty(events) && (
                      <MultiComboBox
                        className={classes.Probability}
                        accessibleName="Event Selection"
                        label="Event Selection"
                        value={event}
                        onChange={setEvent}
                      >
                        {events?.map(
                          (event) =>
                            event && (
                              <MultiComboBoxItem
                                key={event}
                                text={event}
                                value={event}
                              >
                                {event}
                              </MultiComboBoxItem>
                            )
                        )}
                      </MultiComboBox>
                    )}
                    <p />
                    <MultiComboBox
                      className={classes.Probability}
                      accessibleName="Constraint Level"
                      label="Constraint Level"
                      value={origin}
                      onChange={setOrigin}
                    >
                      {origins?.map(
                        (origin) =>
                          origin && (
                            <MultiComboBoxItem
                              key={origin}
                              text={origin}
                              value={origin}
                            >
                              {origin}
                            </MultiComboBoxItem>
                          )
                      )}
                    </MultiComboBox>
                    <p />
                    <MultiComboBox
                      className={classes.Probability}
                      accessibleName="Constraint Level"
                      label="Constraint Level"
                      value={object}
                      onChange={setObject}
                    >
                      {objects?.map(
                        (object) =>
                          object && (
                            <MultiComboBoxItem
                              key={object}
                              text={object}
                              value={object}
                            >
                              {object}
                            </MultiComboBoxItem>
                          )
                      )}
                    </MultiComboBox>
                  </div>
                ))}
            </div>
          </div>
          <div className={classes.SelectedVariants}>
            {constraintData ? (
              <AnalyticalTable
                groupable
                reactTableOptions={{
                  filterTypes: {
                    multiValueFilter: filterFn,
                  },
                }}
                filterable
                columns={[
                  {
                    Header: () => <span>Level</span>,
                    filter: filterFn,
                    accessor: 'Level',
                    headerTooltip: 'Level of the Constraint',
                    disableFilters: false,
                    disableGroupBy: true,
                    disableSortBy: false,
                    Filter: ({ column, popoverRef }) => {
                      const handleChange = (event) => {
                        column.setFilter(
                          event.detail.items.map((item) =>
                            item.getAttribute('text')
                          )
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
                    Cell: (instance) => {
                      const { cell, row, webComponentsReactProperties } =
                        instance;
                      // disable buttons if overlay is active to prevent focus
                      const isOverlay =
                        webComponentsReactProperties.showOverlay;
                      // console.log('This is your row data', row.original);
                      const onDelete = () => {
                        console.log('delete', cell, row);
                        setConstraintData(
                          without(constraintData, row.original)
                        );
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
                    width: 100,
                  },
                ]}
                data={constraintData?.slice(0)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConformanceCheckingSection;
