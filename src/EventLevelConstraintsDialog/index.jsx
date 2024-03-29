import {
  AnalyticalTable,
  Button,
  Dialog,
  FlexBox,
} from '@ui5/webcomponents-react';
import { without, find } from 'lodash';

const EventLevelConstraintsDialog = ({
  dialogIsOpen,
  setDialogIsOpen,
  rightClickInfo,
  setIgnoreConstraint,
  setRightClickInfo,
  ignoreConstraint,
  setResultData,
  resultData,
}) => {
  return (
    <Dialog
      open={dialogIsOpen}
      onAfterClose={() => setDialogIsOpen(false)}
      style={{ width: '100%' }}
    >
      <div>{rightClickInfo?.name}</div>
      <AnalyticalTable
        groupable
        scaleWidthMode="Smart"
        filterable
        minRows={14}
        visibleRows={14}
        data={rightClickInfo?.reason}
        columns={[
          {
            Header: 'Relevance',
            accessor: 'relevance_score',
            width: 50,
            headerTooltip: 'relevance_score',
          },
          {
            Header: 'Level',
            accessor: 'Level',
            width: 100,
            headerTooltip: 'Level of the Constraint',
          },
          {
            Header: 'Object',
            accessor: 'Object',
            headerTooltip: 'Concerning Object',
          },
          {
            Header: 'Constraint',
            accessor: 'reason',
            headerTooltip: 'reason',
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

                setIgnoreConstraint([...ignoreConstraint, ...rows]);

                setRightClickInfo({
                  ...rightClickInfo,
                  reason: without(rightClickInfo.reason, ...rows),
                });
              };
              return (
                <Button icon="delete" disabled={isOverlay} onClick={onDelete} />
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
      <div style={{ margin: 10 }} />
      <FlexBox justifyContent="SpaceBetween">
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
      </FlexBox>
    </Dialog>
  );
};

export default EventLevelConstraintsDialog;
