/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  DynamicPage,
  DynamicPageTitle,
  Title,
  Label,
  Badge,
  FlexBox,
} from '@ui5/webcomponents-react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import {
  isNil,
  isEmpty,
  find,
  indexOf,
  uniqBy,
  tail,
  differenceWith,
} from 'lodash';
import reduceToSankeyArray from './SankeyChart/reduceToSankeyArray';
import Plot from 'react-plotly.js';
import { deleteSelected, colors, findLabel, sankeyColors } from './util';
import {
  findFaultyEventFromFaultyEventsArray,
  reduceFaultyEventsArray,
} from './findFaultyEvents';
import data2 from './variant_array_short';
import ChartBar from './ChartBar';
import sunburstOptions from './SunburstChart/calcCharOption';
import valueFormatter from './SunburstChart/valueFormatter';
import SunburstChart from './SunburstChart';
import EventlogConfig from './EventlogConfig';
import ViolatedConstraintsTable from './ViolatedConstraintsTable';
import EventVariantsDisplay from './EventVariantsDisplay';
import EventLevelConstraintsDialog from './EventLevelConstraintsDialog';
import DeletedConstraintsTable from './DeletedConstraintsTable';
import fetchFiles from './fetchFile';
import UnmappedConstraintsTable from './UnmappedConstraintsTable';

const ConformanceCheckingSection = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [csvRecommendationData, setCsvRecommendationData] = useState([]);
  const [csvResultData, setCsvResultData] = useState([]);
  const [variantData, setVariantData] = useState(data2);
  const [rightClickInfo, setRightClickInfo] = useState(false);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const [constraintData, setConstraintData] = useState();
  const [resultData, setResultData] = useState();
  const [originalResultData, setOriginalResultData] = useState([]);
  const [originalVariantData, setOriginalVariantData] = useState(data2);
  const [diffData, setDiffData] = useState([]);
  const [unmappedData, setUnmappedData] = useState([]);

  const [selectedInputRows, setSelectedInputRows] = useState([]);
  const [selectedOutputRows, setSelectedOutputRows] = useState([]);
  const [sunburstData, setSunburstData] = useState([]);
  const [faultyEvents, setFaultyEvents] = useState([]);
  const [faultyVariants, setFaultyVariants] = useState([]);

  useEffect(() => {
    fetchFiles(
      setCsvRecommendationData,
      'runningexample.xes-recommended_constraintsv_newcolumn.csv'
    );

    fetchFiles(setCsvResultData, 'runningexample.xes-violations_newcolumn.csv');
  }, []);

  const { data, links } = reduceToSankeyArray(variantData);

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

  const onRowSelect = (e, setSelectedRows) => {
    const rows = e.detail.selectedFlatRows.map((x) => x.original);
    setSelectedRows(rows);
  };

  useEffect(() => {
    setConstraintData(
      csvRecommendationData
        .map((row) => ({
          ...row,
          nat_lang_template: row.nat_lang_template
            ?.replaceAll('{1}', `"${findLabel(row, 'left')}"`)
            .replaceAll('{2}', `"${findLabel(row, 'right')}"`)
            .replaceAll('{n}', row.constraint_string?.split('[')[0]?.slice(-1)),
        }))
        .sort((a, b) => b.relevance_score - a.relevance_score)
    );

    const resultData = csvResultData
      .map((row) => ({
        ...row,
        left_op: findLabel(row, 'left'),
        right_op: findLabel(row, 'right'),
        subRows: row.model_name?.split('|').map((x) => ({ model: x })),
        nat_lang_template: row.nat_lang_template
          ?.replaceAll('{1}', `"${findLabel(row, 'left')}"`)
          .replaceAll('{2}', `"${findLabel(row, 'right')}"`)
          .replaceAll('{n}', row.constraint_string?.split('[')[0]?.slice(-1)),
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score);

    setResultData(resultData);
    setOriginalResultData(resultData);
  }, [csvResultData, csvRecommendationData]);

  useEffect(() => {
    if (!isNil(resultData)) {
      const faultyEventsArray = [
        ...new Set(resultData.reduce(reduceFaultyEventsArray, [])),
      ];

      const enhancedRows = variantData.map((currentRow) => {
        const events = currentRow.slice(0, currentRow.length - 1);
        // here we need a magic function that returns all relevant events
        // faulty = includesEvent | includes part of a faulty event name | not faulty
        const faultyEventsFromVariant = events
          .map((event) =>
            findFaultyEventFromFaultyEventsArray(event, faultyEventsArray)
          )
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
      setFaultyVariants(enhancedRows);
      setFaultyEvents(
        enhancedRows.map((x) => x.faultyEventsFromVariant).flat()
      );
      setDiffData(
        differenceWith(
          originalResultData,
          resultData,
          (x, y) => x.obs_id === y.obs_id
        )
      );

      setUnmappedData(
        differenceWith(
          originalResultData,
          enhancedRows
            .map((x) => x.faultyEventsFromVariant)
            .flat()
            .map((x) => x.reason)
            .flat(),
          (x, y) => x.obs_id === y.obs_id
        )
      );

      setSunburstData(
        sunburstOptions({
          data: newData.data,
          locale: 'EN-US',
        })
      );
    }
  }, [resultData, variantData, originalResultData]);

  const markNavigatedInputRow = useCallback(
    (row) => {
      return selectedInputRows?.find((x) => x?.id === row?.id);
    },
    [selectedInputRows]
  );

  const markNavigatedOutputRow = useCallback(
    (row) => {
      return selectedOutputRows?.find((x) => x?.id === row?.id);
    },
    [selectedOutputRows]
  );

  const [ignoreConstraint, setIgnoreConstraint] = useState([]);
  return (
    <>
      <EventLevelConstraintsDialog
        dialogIsOpen={dialogIsOpen}
        setDialogIsOpen={setDialogIsOpen}
        rightClickInfo={rightClickInfo}
        setIgnoreConstraint={setIgnoreConstraint}
        setRightClickInfo={setRightClickInfo}
        ignoreConstraint={ignoreConstraint}
        setResultData={setResultData}
        resultData={resultData}
      />
      <DynamicPage
        alwaysShowContentHeader
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        showHideHeaderButton={false}
        headerContentPinnable={false}
        headerTitle={
          <DynamicPageTitle
            actions={
              <>
                {pathname !== '/' && (
                  <>
                    <Button onClick={() => navigate('/')} design="Emphasized">
                      Configuration
                    </Button>
                  </>
                )}
              </>
            }
            header={<Title>VISCOSE</Title>}
            subHeader={
              <>
                <Label>
                  Visualization of declarative Conformance Checking (an SAP
                  Signavio Evaluation)
                </Label>
                <br />
                <br />
                {pathname !== '/' && (
                  <div>
                    <Badge
                      style={{ width: 200 }}
                      onClick={() => navigate('/variants')}
                    >
                      Variants: {variantData?.length}
                    </Badge>
                    <Badge
                      style={{ width: 200 }}
                      onClick={() => navigate('/table')}
                    >
                      Constraints: {resultData?.length}
                    </Badge>
                    <br />
                    <Badge
                      style={{ width: 200 }}
                      onClick={() => navigate('/variants')}
                    >
                      Deleted Variants:
                      {originalVariantData?.length - variantData?.length}
                    </Badge>
                    <Badge
                      style={{ width: 200 }}
                      onClick={() => navigate('/deleted-constraints-table')}
                    >
                      Deleted Constraints:
                      {originalResultData?.length - resultData?.length}
                    </Badge>
                  </div>
                )}
              </>
            }
          ></DynamicPageTitle>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <EventlogConfig
                setVariantData={setVariantData}
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
                originalResultData={originalResultData}
                setOriginalVariantData={setOriginalVariantData}
                setCsvRecommendationData={setCsvRecommendationData}
                setCsvResultData={setCsvResultData}
              />
            }
          />
          <Route
            path="/variants"
            element={
              <>
                <ChartBar />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  {colors.map(({ color, text }) => (
                    <span
                      key={color}
                      style={{
                        padding: 8,
                        backgroundColor: color,
                        width: 100,
                        height: 50,
                        display: 'inline-block',
                        color: 'black',
                        textAlign: 'center',
                        fontSize: 12,
                      }}
                    >
                      {text}
                    </span>
                  ))}
                  <span
                    key={'white'}
                    style={{
                      padding: 8,
                      backgroundColor: 'white',
                      width: 100,
                      height: 50,
                      display: 'inline-block',
                      color: 'black',
                      textAlign: 'center',
                      fontSize: 12,
                    }}
                  >
                    select event on click
                  </span>
                </div>
                <EventVariantsDisplay
                  originalVariantData={originalVariantData}
                  variantData={variantData}
                  newData={faultyVariants}
                  setDialogIsOpen={setDialogIsOpen}
                  setRightClickInfo={setRightClickInfo}
                  setVariantData={setVariantData}
                />
              </>
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
                ></div>
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
                <div style={{ margin: 10 }} />
                <FlexBox justifyContent="SpaceBetween">
                  <Button
                    icon="reset"
                    onClick={() => setResultData(originalResultData)}
                  >
                    Reset Violated Constraints
                  </Button>
                  <Button
                    icon="opportunity"
                    onClick={() => navigate('/deleted-constraints-table')}
                  >
                    Show Diff
                  </Button>
                  <Button
                    icon="opportunity"
                    onClick={() => navigate('/unmapped-constraints-table')}
                  >
                    Show Unmapped
                  </Button>
                </FlexBox>
              </>
            }
          />
          <Route
            path="/deleted-constraints-table"
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
                ></div>
                {resultData ? (
                  <DeletedConstraintsTable
                    onRowSelect={onRowSelect}
                    deleteSelected={deleteSelected}
                    markNavigatedOutputRow={markNavigatedOutputRow}
                    setSelectedOutputRows={setSelectedOutputRows}
                    setResultData={setResultData}
                    resultData={resultData}
                    diffData={diffData}
                    selectedOutputRows={selectedOutputRows}
                  />
                ) : null}
                <div style={{ margin: 10 }} />
                <FlexBox justifyContent="SpaceBetween">
                  <Button
                    icon="reset"
                    onClick={() => setResultData(originalResultData)}
                  >
                    Reset Violated Constraints
                  </Button>
                  <Button icon="opportunity" onClick={() => navigate('/table')}>
                    Show Current
                  </Button>
                  <Button
                    icon="opportunity"
                    onClick={() => navigate('/unmapped-constraints-table')}
                  >
                    Show Unmapped
                  </Button>
                </FlexBox>
              </>
            }
          />
          <Route
            path="/unmapped-constraints-table"
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
                ></div>
                {resultData ? (
                  <UnmappedConstraintsTable
                    onRowSelect={onRowSelect}
                    deleteSelected={deleteSelected}
                    markNavigatedOutputRow={markNavigatedOutputRow}
                    setSelectedOutputRows={setSelectedOutputRows}
                    setResultData={setResultData}
                    resultData={resultData}
                    unmappedData={unmappedData}
                    selectedOutputRows={selectedOutputRows}
                  />
                ) : null}
                <div style={{ margin: 10 }} />
                <FlexBox justifyContent="SpaceBetween">
                  <Button
                    icon="opportunity"
                    onClick={() => navigate('/deleted-constraints-table')}
                  >
                    Show Diff
                  </Button>
                  <Button icon="opportunity" onClick={() => navigate('/table')}>
                    Show Current
                  </Button>
                </FlexBox>
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
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      marginBottom: 20,
                    }}
                  >
                    {sankeyColors.map(({ color, text }) => (
                      <span
                        key={color}
                        style={{
                          padding: 8,
                          backgroundColor: color,
                          width: 100,
                          height: 50,
                          display: 'inline-block',
                          color: 'black',
                          textAlign: 'center',
                          fontSize: 12,
                        }}
                      >
                        {text}
                      </span>
                    ))}
                    <span
                      key={'white'}
                      style={{
                        padding: 8,
                        backgroundColor: 'white',
                        width: 100,
                        height: 50,
                        display: 'inline-block',
                        color: 'black',
                        textAlign: 'center',
                        fontSize: 12,
                      }}
                    >
                      select event on click
                    </span>
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
                          .map((x) => {
                            const currentRow = find(
                              find(faultyEvents, {
                                faultyEvent: points[0].label,
                              })?.reason,
                              { reason: x }
                            );
                            return {
                              reason: currentRow?.reason,
                              obs_id: currentRow?.obs_id,
                              num_violations: currentRow?.num_violations,
                              Object: currentRow?.Object,
                              template: currentRow?.template,
                              Level: currentRow?.Level,
                              relevance_score: currentRow?.relevance_score,
                            };
                          }),
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
                            'occurred: %{value} times %{customdata} <b></b><extra></extra>',
                          label: data.map((x) => x.name),
                          color: data.map((x) => {
                            const a = find(
                              uniqBy(faultyEvents, 'faultyEvent'),
                              {
                                faultyEvent: x.name,
                              }
                            );
                            if (!isNil(a)) {
                              return a.level === 'faulty' ? 'red' : 'orange';
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
                      width: 1250,
                      height: 600,
                      title: 'Sankey Plot of Events',
                      tooltip: {
                        // Edit the tooltip here
                        text: 'Tooltip title',
                      },
                    }}
                  />
                  <br />
                </div>
              </>
            }
          />
        </Routes>
      </DynamicPage>
    </>
  );
};

export default ConformanceCheckingSection;
