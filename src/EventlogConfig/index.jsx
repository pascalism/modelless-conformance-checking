import { useState } from 'react';
import {
  Button,
  Title,
  Label,
  FileUploader,
  Avatar,
  Badge,
  Wizard,
  WizardStep,
  ButtonDesign,
  WrappingType,
} from '@ui5/webcomponents-react';
import { objectMap } from '../util';
import SuggestedConstraintsTable from '../SuggestedConstraintsTable';
import ViolatedConstraintsTable from '../ViolatedConstraintsTable';

const EventlogConfig = ({
  navigate,
  constraintData,
  deleteSelected,
  markNavigatedOutputRow,
  selectedInputRows,
  setConstraintData,
  onRowSelect,
  setSelectedOutputRows,
  resultData,
  setResultData,
  selectedOutputRows,
  markNavigatedInputRow,
  setSelectedInputRows,
}) => {
  const [selectedWizard, setSelectedWizard] = useState({
    1: { selected: true, disabled: false },
    2: { selected: false, disabled: true },
    3: { selected: false, disabled: true },
  });

  const handleStepChange = (e) => {
    setSelectedWizard({
      ...objectMap(selectedWizard, (x) => ({
        selected: false,
        disabled: x.disabled,
      })),
      [e.detail.step.dataset.step]: { selected: true, disabled: false },
    });
  };

  return (
    <Wizard
      onStepChange={(all) => handleStepChange(all)}
      contentLayout="SingleStep"
    >
      <WizardStep
        icon="product"
        titleText="Event log Upload"
        disabled={selectedWizard['1'].disabled}
        selected={selectedWizard['1'].selected}
        data-step={'1'}
      >
        <Title>1. Event log Upload</Title>
        <Label wrappingType={WrappingType.None}>
          Sed fermentum, mi et tristique ullamcorper, sapien sapien faucibus
          sem, quis pretium nibh lorem malesuada diam. Nulla quis arcu aliquet,
          feugiat massa semper, volutpat diam. Nam vitae ante posuere, molestie
          neque sit amet, dapibus velit. Maecenas eleifend tempor lorem. Mauris
          vitae elementum mi, sed eleifend ligula. Nulla tempor vulputate dolor,
          nec dignissim quam convallis ut. Praesent vitae commodo felis, ut
          iaculis felis. Fusce quis eleifend sapien, eget facilisis nibh.
          Suspendisse est velit, scelerisque ut commodo eget, dignissim quis
          metus. Cras faucibus consequat gravida. Curabitur vitae quam felis.
          Phasellus ac leo eleifend, commodo tortor et, varius quam. Aliquam
          erat volutpat
        </Label>
        <FileUploader hideInput>
          <Avatar icon="upload" />
        </FileUploader>
        <FileUploader hideInput>
          <Badge>{'Upload file'}</Badge>
        </FileUploader>
        <br />
        <Button
          design={ButtonDesign.Emphasized}
          onClick={() =>
            setSelectedWizard({
              ...objectMap(selectedWizard, (x) => ({
                selected: false,
                disabled: x.disabled,
              })),
              2: { selected: true, disabled: false },
            })
          }
        >
          Continue to Configure Suggested Constraints
        </Button>
        <br />
        <Button icon="donut-chart" onClick={() => navigate('/sunburst')}>
          Sunburst
        </Button>
        <Button icon="opportunity" onClick={() => navigate('/sankey')}>
          Sankey
        </Button>
      </WizardStep>
      <WizardStep
        icon="hint"
        titleText="Configure Suggested Constraints"
        disabled={selectedWizard['2'].disabled}
        selected={selectedWizard['2'].selected}
        data-step={'2'}
      >
        <Title>2. Configure Suggested Constraints</Title>
        <Label wrappingType={WrappingType.None}>
          Integer pellentesque leo sit amet dui vehicula, quis ullamcorper est
          pulvinar. Nam in libero sem. Suspendisse arcu metus, molestie a turpis
          a, molestie aliquet dui. Donec ppellentesque leo sit amet dui
          vehicula, quis ullamcorper est pulvinar. Nam in libero sem.
          Suspendisse arcu metus, molestie a turpis a, molestie aliquet dui.
          Donec pulvinar, sapien corper eu, posuere malesuada nisl. Integer
          pellentesque leo sit amet dui vehicula, quis ullamcorper est pulvinar.
          Nam in libero sem. Suspendisse arcu metus, molestie a turpis a,
          molestie aliquet dui. Donec pulvinar, sapien
        </Label>
        {constraintData ? (
          <SuggestedConstraintsTable
            markNavigatedInputRow={markNavigatedInputRow}
            setSelectedInputRows={setSelectedInputRows}
            setConstraintData={setConstraintData}
            constraintData={constraintData}
            selectedInputRows={selectedInputRows}
            onRowSelect={onRowSelect}
            deleteSelected={deleteSelected}
          />
        ) : null}
        <br />
        <Button
          design={ButtonDesign.Emphasized}
          onClick={() =>
            setSelectedWizard({
              ...objectMap(selectedWizard, (x) => ({
                selected: false,
                disabled: x.disabled,
              })),
              3: { selected: true, disabled: false },
            })
          }
        >
          Continue to Violated Constraints
        </Button>
      </WizardStep>
      <WizardStep
        icon="lead"
        titleText="Violated Constraints"
        disabled={selectedWizard['3'].disabled}
        selected={selectedWizard['3'].selected}
        data-step={'3'}
      >
        <Title>3. Violated Constraints</Title>
        <Label wrappingType={WrappingType.None}>
          Integer pellentesque leo sit amet dui vehicula, quis ullamcorper est
          pulvinar. Nam in libero sem. Suspendisse arcu metus, molestie a turpis
          a, molestie aliquet dui. Donec ppellentesque leo sit amet dui
          vehicula, quis ullamcorper est pulvinar. Nam in libero sem.
          Suspendisse arcu metus, molestie a turpis a, molestie aliquet dui.
          Donec pulvinar, sapien corper eu, posuere malesuada nisl. Integer
          pellentesque leo sit amet dui vehicula, quis ullamcorper est pulvinar.
          Nam in libero sem. Suspendisse arcu metus, molestie a turpis a,
          molestie aliquet dui. Donec pulvinar, sapien
        </Label>
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
        <Button
          icon="delete"
          onClick={() =>
            deleteSelected(resultData, selectedOutputRows, setResultData)
          }
        >
          Delete Selected
        </Button>
        <br />
        <Button icon="donut-chart" onClick={() => navigate('/sunburst')}>
          Sunburst
        </Button>
        <Button icon="opportunity" onClick={() => navigate('/sankey')}>
          Sankey
        </Button>
      </WizardStep>
    </Wizard>
  );
};

export default EventlogConfig;
