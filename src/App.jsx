/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from 'react';
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
import sunburstOptions from './calcCharOption';
import {
  CONSTRAINT_LEVELS,
  makeCompressedMapsExampleInput,
  makeCompressedMapsExampleOutput,
} from './util';
// import { makeCompressedMapsExampleOutput } from './files/output_bpichallenge';
import { without, isNil, isEmpty, find, indexOf, uniqBy, tail } from 'lodash';
import valueFormatter from './valueFormatter';
import Graph from './Graph';
import data2 from './files/variant_array_short';
import Plot from 'react-plotly.js';

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
  function reduceToSankeyArray(inputData) {
    const data = [];
    const links = [];

    inputData.map((entry, index) => {
      const eventCount = entry[entry.length - 1];
      const nodes = entry.slice(0, -1); // Exclude the last element (count)

      for (let i = 0; i < nodes.length - 1; i++) {
        const sourceNode = nodes[i];
        const targetNode = nodes[i + 1];

        if (!data.find((x) => x.name === sourceNode + index + i)) {
          data.push({ name: sourceNode });
        }

        if (!data.find((x) => x.name === targetNode + index + i)) {
          data.push({ name: targetNode });
        }

        const existingLink = links.find(
          (x) => x.source === sourceNode && x.target === targetNode
        );

        if (existingLink) {
          existingLink.value += eventCount;
        } else {
          links.push({
            source: sourceNode,
            target: targetNode,
            value: eventCount,
          });
        }
      }
    });
    // Consolidate links with the same source and target nodes
    const consolidatedLinks = [];
    links.forEach((link) => {
      const existingConsolidatedLink = consolidatedLinks.find(
        (x) => x.source === link.source && x.target === link.target
      );

      if (existingConsolidatedLink) {
        existingConsolidatedLink.value += link.value;
      } else {
        consolidatedLinks.push({ ...link });
      }
    });

    return { data: uniqBy(data, 'name'), links: consolidatedLinks };
  }
  const { data, links } = reduceToSankeyArray(data2);

  const { source, target, value } = links
    .map((x) => [
      indexOf(
        data.map((x) => x.name),
        x.source
      ),
      indexOf(
        data.map((x) => x.name),
        x.target
      ),
      x.value,
    ])
    .reduce(
      ({ source, target, value }, current) => ({
        source: [...source, current[0]],
        target: [...target, current[1]],
        value: [...value, current[2]],
      }),
      { source: [], target: [], value: [] }
    );

  const [rightClickInfo, setRightClickInfo] = useState(false);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const [constraintData, setConstraintData] = useState();
  const [resultData, setResultData] = useState();

  const [selectedRows, setSelectedRows] = useState([]);
  const [sunburstData, setSunburstData] = useState();
  const [faultyEvents, setFaultyEvents] = useState([]);

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

  const findFaultyEvents = (event, faultyEventsArray) => {
    return faultyEventsArray.reduce((acc, current) => {
      // actually contained
      if (current.eventName === event) {
        return [
          ...acc,
          {
            faultyEvent: event,
            reason: current.reason,
            level: 'faulty',
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
      const faultyEventsArray = [
        ...new Set(
          resultData.reduce((acc, currentRow) => {
            const a = find(acc, { eventName: currentRow.left_op });
            if (!isNil(a)) {
              return replaceAt(acc, indexOf(acc, a), {
                eventName: currentRow.left_op,
                reason: !isNil(a)
                  ? [
                      ...a.reason,
                      {
                        reason: currentRow.nat_lang_template,
                        obs_id: currentRow.obs_id,
                      },
                    ]
                  : [
                      {
                        reason: currentRow.nat_lang_template,
                        obs_id: currentRow.obs_id,
                      },
                    ],
              });
            }
            return [
              ...acc,
              {
                eventName: currentRow.left_op,
                reason: [
                  {
                    reason: currentRow.nat_lang_template,
                    obs_id: currentRow.obs_id,
                  },
                ],
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
          .map((event) => findFaultyEvents(event, faultyEventsArray))
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
      setFaultyEvents(
        enhancedRows.map((x) => x.faultyEventsFromVariant).flat()
      );

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
      <Dialog
        open={dialogIsOpen}
        onAfterClose={() => setDialogIsOpen(false)}
        style={{ height: '100%', width: '100%' }}
      >
        <div>{rightClickInfo?.name}</div>
        <AnalyticalTable
          groupable
          scaleWidthMode="Smart"
          filterable
          data={rightClickInfo?.reason}
          columns={[
            {
              Header: 'Constraint',
              accessor: 'reason',
              headerTooltip: 'reason',
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
        <div style={{ marginBottom: 0 }}>
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
              setDialogIsOpen(false);
              setResultData(
                resultData.filter(
                  (x) => !find(ignoreConstraint, (y) => y.obs_id === x.obs_id)
                )
              );

              setIgnoreConstraint([]);
            }}
          >
            Apply
          </Button>
        </div>
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
          width: '2000px',
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
        {constraintData ? (
          <AnalyticalTable
            markNavigatedRow={markNavigatedRow}
            groupable
            scaleWidthMode="Smart"
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
                    <Button
                      icon="delete"
                      disabled={isOverlay}
                      onClick={onDelete}
                    />
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
        ) : null}
        <Button icon="delete" onClick={deleteSelected}>
          Delete Selected
        </Button>
        <div style={{ margin: 100 }} />
        <Title>Output</Title>
        {resultData ? (
          <AnalyticalTable
            groupable
            scaleWidthMode="Smart"
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

                    setResultData(without(resultData, ...rows));
                  };
                  return (
                    <Button
                      icon="delete"
                      disabled={isOverlay}
                      onClick={onDelete}
                    />
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
        ) : null}
        <div style={{ margin: 100 }} />
        {/* <Title>Graph</Title>
        <Graph /> */}
        <Title>Sunburst</Title>

        <EchartsComponent
          onEvents={{
            contextmenu: ({ data, event }) => {
              event.event.preventDefault();
              setRightClickInfo({
                name: data.name,
                reason: data.reason,
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
        <Title>Sankey</Title>
        <Plot
          onClick={({ points }) => {
            console.log(points);
            setRightClickInfo({
              name: points[0].label,
              reason: tail(points[0].customdata.split('<br>'))
                .filter((x) => !isEmpty(x))
                .map((x) => ({
                  reason: x,
                  obs_id: find(
                    find(faultyEvents, { faultyEvent: points[0].label })
                      ?.reason,
                    { reason: x }
                  )?.obs_id,
                })),
            });
            setDialogIsOpen(true);
          }}
          data={[
            {
              type: 'sankey',
              orientation: 'h',
              arrangement: 'fixed',
              node: {
                pad: 15,
                thickness: 30,
                line: {
                  color: 'black',
                  width: 0.5,
                },
                customdata: data.map((x) => {
                  const a = find(uniqBy(faultyEvents, 'faultyEvent'), {
                    faultyEvent: x.name,
                  });
                  if (!isNil(a)) {
                    return (
                      x.name +
                      '<br>' +
                      a.reason?.map((x) => x.reason).join('<br>') +
                      '<br>'
                    );
                  }
                  return x.name + '<br>';
                }),
                metadata: data,
                hovertemplate:
                  '%{customdata} <b></b>occurred: %{value} times<extra></extra>',
                label: data.map((x) => x.name),
                color: data.map((x) => {
                  const a = find(uniqBy(faultyEvents, 'faultyEvent'), {
                    faultyEvent: x.name,
                  });
                  if (!isNil(a)) {
                    return a.level === 'faulty' ? 'red' : 'yellow';
                  }
                  return 'green';
                }),
              },

              link: {
                source,
                target,
                value,
              },
            },
          ]}
          layout={{
            width: 1200,
            height: 800,
            title: 'Sankey Plot of Events',
            tooltip: {
              // Edit the tooltip here
              text: 'Tooltip title',
            },
          }}
        />
      </DynamicPage>
    </>
  );
};

export default ConformanceCheckingSection;
