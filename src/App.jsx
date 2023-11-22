/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from 'react';
import {
  AnalyticalTable,
  Button,
  DynamicPageHeader,
  DynamicPage,
  DynamicPageTitle,
  Title,
  FlexBox,
  Label,
  Dialog,
} from '@ui5/webcomponents-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import {
  makeCompressedMapsExampleInput,
  makeCompressedMapsExampleOutput,
  replaceAt,
  findFaultyEvents,
  deleteSelected,
} from './util';
// import { makeCompressedMapsExampleOutput } from './files/output_bpichallenge';
import { without, isNil, isEmpty, find, indexOf, uniqBy, tail } from 'lodash';
import data2 from './files/variant_array_short';
import reduceToSankeyArray from './SankeyChart/reduceToSankeyArray';
import Plot from 'react-plotly.js';
import ChartBar from './ChartBar';
import sunburstOptions from './SunburstChart/calcCharOption';
import valueFormatter from './SunburstChart/valueFormatter';
import SunburstChart from './SunburstChart';
import EventlogConfig from './EventlogConfig';
import ViolatedConstraintsTable from './ViolatedConstraintsTable';

const ConformanceCheckingSection = () => {
  const navigate = useNavigate();

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

  const [selectedInputRows, setSelectedInputRows] = useState([]);
  const [selectedOutputRows, setSelectedOutputRows] = useState([]);
  const [sunburstData, setSunburstData] = useState();
  const [faultyEvents, setFaultyEvents] = useState([]);

  const onRowSelect = (e, setSelectedRows) => {
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

  const markNavigatedInputRow = useCallback(
    (row) => {
      return selectedInputRows?.find((x) => x.id === row.id);
    },
    [selectedInputRows]
  );

  const markNavigatedOutputRow = useCallback(
    (row) => {
      return selectedOutputRows?.find((x) => x.id === row.id);
    },
    [selectedOutputRows]
  );

  const [ignoreConstraint, setIgnoreConstraint] = useState([]);

  return (
    <div style={{ height: '100%', width: '100%', margin: 0, padding: 0 }}>
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
                <Label>(a SAP Signavio Evaluation)</Label>
              </FlexBox>
              <span style={{ width: '1rem' }} />
            </FlexBox>
          </DynamicPageHeader>
        }
        headerTitle={
          <DynamicPageTitle
            actions={
              <>
                <Button onClick={() => navigate('/')} design="Emphasized">
                  Configure Eventlog
                </Button>
              </>
            }
            header={<Title>VISCOSE</Title>}
            subHeader={
              <Label>Visualization of declarative Conformance Checking</Label>
            }
          ></DynamicPageTitle>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <EventlogConfig
                navigate={navigate}
                constraintData={constraintData}
                deleteSelected={deleteSelected}
                markNavigatedOutputRow={markNavigatedOutputRow}
                selectedInputRows={selectedInputRows}
                setConstraintData={setConstraintData}
                onRowSelect={onRowSelect}
                setSelectedOutputRows={setSelectedOutputRows}
                resultData={resultData}
                setResultData={setResultData}
                selectedOutputRows={selectedOutputRows}
                markNavigatedInputRow={markNavigatedInputRow}
                setSelectedInputRows={setSelectedInputRows}
              />
            }
          />
          <Route
            path="/table"
            element={
              <>
                <ChartBar />
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                  }}
                >
                  <Button design="Transparent" icon="full-screen" />
                </div>
                {resultData ? (
                  <ViolatedConstraintsTable
                    onRowSelect={onRowSelect}
                    deleteSelected={deleteSelected}
                    markNavigatedOutputRow={markNavigatedOutputRow}
                    setSelectedOutputRows={setSelectedOutputRows}
                    setResultData={setResultData}
                    resultData={resultData}
                    selectedOutputRows={selectedOutputRows}
                  />
                ) : null}
              </>
            }
          />
          <Route
            path="/sunburst"
            element={
              <>
                <ChartBar />
                <SunburstChart
                  sunburstData={sunburstData}
                  setRightClickInfo={setRightClickInfo}
                  setDialogIsOpen={setDialogIsOpen}
                />
              </>
            }
          />
          <Route
            path="/sankey"
            element={
              <>
                <ChartBar />
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <Title>(select event on click)</Title>
                  <Button design="Transparent" icon="full-screen" />
                </div>
                <Plot
                  onClick={({ points }) => {
                    if (isNil(points[0]?.customdata)) {
                      return;
                    }
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
                        customdata: data.map((dataPoint) => {
                          const faultyEvent = find(
                            uniqBy(faultyEvents, 'faultyEvent'),
                            {
                              faultyEvent: dataPoint.name,
                            }
                          );
                          if (!isNil(faultyEvent)) {
                            return (
                              dataPoint.name +
                              '<br>' +
                              faultyEvent.reason
                                ?.map((dataPoint) => dataPoint.reason)
                                .join('<br>') +
                              '<br>'
                            );
                          }
                          return dataPoint.name + '<br>';
                        }),
                        metadata: data,
                        hovertemplate:
                          '%{customdata}|Cluster <b></b>occurred: %{value} times<extra></extra>',
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
                <br />
              </>
            }
          />
        </Routes>
      </DynamicPage>
    </div>
  );
};

export default ConformanceCheckingSection;
