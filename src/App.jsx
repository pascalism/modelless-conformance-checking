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
} from '@ui5/webcomponents-react';
import EchartsComponent from 'echarts-for-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import calcChartOption from './calcCharOption';
import {
  CONSTRAINT_LEVELS,
  makeCompressedMaps,
  makeCompressedMapsOutput,
} from './util';
import { without } from 'lodash';
import valueFormatter from './valueFormatter';
import Graph from './Graph';
import data2 from './files/variant_array';

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
  const [resultData, setResultData] = useState();

  const [selectedRows, setSelectedRows] = useState([]);

  const onRowSelect = (e) => {
    const rows = e.detail.selectedFlatRows.map((x) => x.original);
    setSelectedRows(rows);
  };
  const { data } = valueFormatter({ data: data2 });
  const defaultOptions = calcChartOption({
    data,
    locale: 'EN-US',
  });
  console.log(defaultOptions.series.data);
  useEffect(() => {
    makeCompressedMaps().then((result) =>
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
    makeCompressedMapsOutput().then(
      (result) =>
        console.log(result.length) ||
        setResultData(
          result.map((row) => ({
            ...row,
            subRows: row.model_name?.split('|').map((x) => ({ model: x })),
            nat_lang_template: row.nat_lang_template
              ?.replaceAll('{1}', `"${row.left_op}"`)
              .replaceAll('{2}', `"${row.right_op}"`)
              .replaceAll(
                '{n}',
                row.constraint_string?.split('[')[0]?.slice(-1)
              ),
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
        ) : null}
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
        <Title>Graph</Title>
        <Graph />
        <Title>Sunkey</Title>
        <EchartsComponent
          style={{
            height: 1000,
            width: 1000,
          }}
          option={defaultOptions}
          lazyUpdate
          notMerge
        />
      </DynamicPage>
    </>
  );
};

export default ConformanceCheckingSection;
