/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  AnalyticalTable,
  MultiComboBox,
  MultiComboBoxItem,
  Button,
  DynamicPageHeader,
  DynamicPage,
  DynamicPageTitle,
  Title,
  FlexBox,
  Label,
  FileUploader,
  Avatar,
  Badge,
  Dialog,
} from '@ui5/webcomponents-react';
import EchartsComponent from 'echarts-for-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import ContextMenu from '@agjs/react-right-click-menu';
import sunburstOptions from './calcCharOption';
import {
  CONSTRAINT_LEVELS,
  makeCompressedMapsExampleInput,
  makeCompressedMapsExampleOutput,
} from './util';
// import { makeCompressedMapsExampleOutput } from './files/output_bpichallenge';
import { without, isNil, isEmpty, find, indexOf } from 'lodash';
import valueFormatter from './valueFormatter';
import Graph from './Graph';
import data2 from './files/variant_array_short';

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

const replaceAt = (array = [], index, value) => {
  const ret = [...array];
  ret[index] = value;
  return ret;
};

const ConformanceCheckingSection = () => {
  const [rightClickInfo, setRightClickInfo] = useState(false);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const [constraintData, setConstraintData] = useState();
  const [resultData, setResultData] = useState();

  const [selectedRows, setSelectedRows] = useState([]);
  const [sunburstData, setSunburstData] = useState();

  const onRowSelect = (e) => {
    const rows = e.detail.selectedFlatRows.map((x) => x.original);
    setSelectedRows(rows);
  };

  useEffect(() => {
    makeCompressedMapsExampleInput().then((result) =>
      setConstraintData(
        result.map((row) => ({
          ...row,
          nat_lang_template: row.nat_lang_template
            .replaceAll('{1}', `"${row.left_op}"`)
            .replaceAll('{2}', `"${row.right_op}"`)
            .replaceAll('{n}', row.constraint_string?.split('[')[0]?.slice(-1)),
        }))
      )
    );
    makeCompressedMapsExampleOutput().then((result) =>
      setResultData(
        result.map((row) => ({
          ...row,
          subRows: row.model_name?.split('|').map((x) => ({ model: x })),
          nat_lang_template: row.nat_lang_template
            ?.replaceAll('{1}', `"${row.left_op}"`)
            .replaceAll('{2}', `"${row.right_op}"`)
            .replaceAll('{n}', row.constraint_string?.split('[')[0]?.slice(-1)),
        }))
      )
    );
  }, []);

  const findFaultyEvents = (event, faultyEvents) => {
    return faultyEvents.reduce((acc, current) => {
      // actually contained
      if (current.eventName === event) {
        return [
          ...acc,
          {
            faultyEvent: event,
            reason: current.reason,
            level: 'faulty',
            rest: current,
          },
        ];
      }
      // partly contained
      const partlyContainedEvents = event
        .split(' ')
        ?.reduce((acc, currentEventNameSplit) => {
          if (current.eventName === currentEventNameSplit) {
            return [
              ...acc,
              {
                faultyEvent: event,
                reason: current.reason,
                level: 'partlyFaulty',
                rest: current,
              },
            ];
          }
          return acc;
        }, []);
      return [...acc, ...partlyContainedEvents];
    }, []);
  };

  useEffect(() => {
    if (!isNil(resultData)) {
      const faultyEvents = [
        ...new Set(
          resultData.reduce((acc, currentRow) => {
            const a = find(acc, { eventName: currentRow.left_op });
            if (!isNil(a)) {
              return replaceAt(acc, indexOf(acc, a), {
                eventName: currentRow.left_op,
                reason: !isNil(a)
                  ? `${a.reason} <br /> ${currentRow.nat_lang_template}`
                  : currentRow.nat_lang_template,
              });
            }
            return [
              ...acc,
              {
                eventName: currentRow.left_op,
                reason: currentRow.nat_lang_template,
              },
            ];
          }, [])
        ),
      ];

      const enhancedRows = data2.map((currentRow) => {
        const events = currentRow.slice(0, currentRow.length - 1);
        // here we need a magic function that returns all relevant events
        // faulty = includesEvent | includes part of a faulty event name | not faulty
        const faultyEventsFromVariant = events
          .map((event) => findFaultyEvents(event, faultyEvents))
          .flat();

        const measure = currentRow[currentRow.length - 1];
        return {
          events,
          measure,
          isFaulty: !isEmpty(faultyEventsFromVariant),
          faultyEventsFromVariant,
        };
      });

      const newData = valueFormatter({ data: enhancedRows });

      setSunburstData(
        sunburstOptions({
          data: newData.data,
          locale: 'EN-US',
        })
      );
    }
  }, [resultData]);

  const markNavigatedRow = useCallback(
    (row) => {
      return selectedRows?.find((x) => x.id === row.id);
    },
    [selectedRows]
  );

  const deleteSelected = () =>
    setConstraintData(without(constraintData, ...selectedRows));

  const [ignoreConstraint, setIgnoreConstraint] = useState([]);

  return (
    <>
      <Button
        onClick={() => {
          setDialogIsOpen(true);
        }}
      >
        Open Dialog
      </Button>
      <Dialog
        open={dialogIsOpen}
        onAfterClose={() => setDialogIsOpen(false)}
        style={{ height: '100%', width: '100%' }}
      >
        <div>{rightClickInfo?.name}</div>
        <AnalyticalTable
          groupable
          scaleWidthMode="Grow"
          filterable
          data={rightClickInfo?.reason}
          columns={[
            {
              Header: 'Constraint',
              accessor: 'constraint',
              headerTooltip: 'constraint',
            },
            {
              Cell: (instance) => {
                const { cell, row, webComponentsReactProperties } = instance;
                // disable buttons if overlay is active to prevent focus
                const isOverlay = webComponentsReactProperties.showOverlay;
                // console.log('This is your row data', row.original);
                const onDelete = () => {
                  const rows = row.original
                    ? [row.original]
                    : row.leafRows.map((x) => x.original);
                  console.log(
                    'delete',
                    cell,
                    rows,
                    without(rightClickInfo.reason, ...rows)
                  );
                  setIgnoreConstraint([...ignoreConstraint, ...rows]);

                  setRightClickInfo({
                    ...rightClickInfo,
                    reason: without(rightClickInfo.reason, ...rows),
                  });
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
              width: 50,
              disableFilters: true,
              disableGroupBy: true,
              disableResizing: true,
              disableSortBy: true,
              id: 'actions',
            },
          ]}
        />
        <Button
          onClick={() => {
            setDialogIsOpen(false);
            setIgnoreConstraint([]);
          }}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            // IGNORE
            console.log(
              ignoreConstraint,
              constraintData.filter(
                (x) =>
                  !ignoreConstraint
                    .map((x) => x.constraint.replaceAll('"', '\\"'))
                    .includes(x.nat_lang_template)
              )
            );
            setDialogIsOpen(false);
            setConstraintData(
              constraintData.filter(
                (x) =>
                  !ignoreConstraint
                    .map((x) => x.constraint.replaceAll('"', '\\"'))
                    .includes(x.nat_lang_template)
              )
            );
            setIgnoreConstraint([]);
          }}
        >
          Apply
        </Button>
      </Dialog>
      <DynamicPage
        headerContent={
          <DynamicPageHeader>
            <FlexBox wrap="Wrap">
              <FlexBox direction="Column">
                <Label>WIP</Label>
              </FlexBox>
              <span style={{ width: '1rem' }} />
            </FlexBox>
          </DynamicPageHeader>
        }
        headerTitle={
          <DynamicPageTitle
            actions={
              <>
                <Button design="Emphasized">Edit</Button>
                <Button design="Transparent">Delete</Button>
                <Button design="Transparent">Copy</Button>
                <Button design="Transparent" icon="action" />
              </>
            }
            header={<Title>Modelless Conformance Checking</Title>}
            navigationActions={
              <>
                <Button design="Transparent" icon="full-screen" />
                <Button design="Transparent" icon="exit-full-screen" />
                <Button design="Transparent" icon="decline" />
              </>
            }
            subHeader={<Label>Prototype</Label>}
          ></DynamicPageTitle>
        }
        style={{
          height: '2000px',
          width: '1440px',
        }}
      >
        <Title>Upload</Title>
        <FileUploader hideInput>
          <Avatar icon="upload" />
        </FileUploader>
        <FileUploader hideInput>
          <Badge>{'Upload file'}</Badge>
        </FileUploader>
        <div style={{ margin: 100 }} />
        <Title>Input</Title>
        {/* {constraintData ? (
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
                disableGroupBy: false,
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
                    const rows = row.original
                      ? [row.original]
                      : row.leafRows.map((x) => x.original);
                    console.log(
                      'delete',
                      cell,
                      row.original,
                      rows,
                      without(constraintData, ...rows)
                    );

                    setConstraintData(without(constraintData, ...rows));
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
        ) : null} */}
        <Button icon="delete" onClick={deleteSelected}>
          Delete Selected
        </Button>
        <div style={{ margin: 100 }} />
        <Title>Output</Title>
        {resultData ? (
          <AnalyticalTable
            groupable
            scaleWidthMode="Grow"
            filterable
            visibleRows="10"
            columns={[
              {
                Header: 'Relevance Score',
                accessor: 'relevance_score',
                headerTooltip: 'relevance_score',
                disableGroupBy: true,
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
            ]}
            data={resultData}
          />
        ) : null}
        <div style={{ margin: 100 }} />
        {/* <Title>Graph</Title>
        <Graph /> */}
        <Title>Sunburst</Title>

        <EchartsComponent
          onEvents={{
            contextmenu: ({ data, event }) => {
              console.log(data, event);
              event.event.preventDefault();
              setRightClickInfo({
                name: data.name,
                reason: data.reason
                  ?.split('<br />')
                  ?.map((x) => ({ constraint: x })),
              });
              setDialogIsOpen(true);
            },
          }}
          style={{
            height: 1000,
            width: 1000,
          }}
          option={sunburstData ? sunburstData : []}
          lazyUpdate
          notMerge
        />
      </DynamicPage>
    </>
  );
};

export default ConformanceCheckingSection;
