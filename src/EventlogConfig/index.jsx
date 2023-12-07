import { useState, useEffect } from 'react';
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
  FlexBox,
  Select,
  Option,
} from '@ui5/webcomponents-react';
import { objectMap, fetchData } from '../util';
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
  originalResultData,
  setCsvRecommendationData,
  setCsvResultData,
}) => {
  const [selectedWizard, setSelectedWizard] = useState({
    1: { selected: true, disabled: false },
    2: { selected: false, disabled: true },
    3: { selected: false, disabled: true },
  });

  const [selectedFile, setSelectedFile] = useState({
    text: 'Test Log',
    value: 'Test Log',
  });
  /*
            {
              text: 'Test Log',
              value: 'test_log',
            },
            {
              text: 'Salesforce Log',
              value: 'salesforce_log',
            },
            {
              text: 'BPI Challenge Log',
              value: 'bpi_log', // missing
            },
  */
  useEffect(() => {
    console.log('here', selectedFile);
    switch (selectedFile) {
      case 'Test Log':
        fetchData(
          setCsvRecommendationData,
          'src/files/runningexample.xes-recommended_constraintsv_newcolumn.csv'
        );
        fetchData(
          setCsvResultData,
          'src/files/runningexample.xes-violations_newcolumn.csv'
        );
        return;
      case 'Salesforce Log':
        fetchData(
          setCsvRecommendationData,
          'src/files/borodoro_2_0-events.pkl-recommended_constraints.csv'
        );
        fetchData(
          setCsvResultData,
          'src/files/borodoro_2_0-events.pkl-violations_lesscolumns.csv'
        );
        return;
      default:
        fetchData(
          setCsvRecommendationData,
          'src/files/runningexample.xes-recommended_constraintsv_newcolumn.csv'
        );
        fetchData(
          setCsvResultData,
          'src/files/runningexample.xes-violations_newcolumn.csv'
        );
        break;
    }
  }, [selectedFile, setCsvRecommendationData, setCsvResultData]);

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
        <Title>Use pre-configured Event log</Title>
        <Select
          onChange={(event) =>
            setSelectedFile(event.detail.selectedOption.innerText)
          }
          style={{ width: '100%' }}
        >
          {[
            {
              text: 'Test Log',
              value: 'test_log',
            },
            {
              text: 'Salesforce Log',
              value: 'salesforce_log',
            },
            {
              text: 'BPI Challenge Log',
              value: 'bpi_log', // missing
            },
          ].map(({ text, value }) => {
            return (
              <Option key={value} selected={value === selectedFile.value}>
                {text}
              </Option>
            );
          })}
        </Select>
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
        <Button icon="opportunity" onClick={() => navigate('/sunburst')}>
          Continue to Visualization
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
        <Button icon="opportunity" onClick={() => navigate('/sunburst')}>
          Continue to Visualization
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
        <br />
        <FlexBox>
          <Button
            icon="reset"
            onClick={() => setResultData(originalResultData)}
          >
            Reset Violated Constraints
          </Button>
          <br />
          <Button icon="opportunity" onClick={() => navigate('/sunburst')}>
            Show Diff
          </Button>
          <Button icon="opportunity" onClick={() => navigate('/sunburst')}>
            Continue to Visualization
          </Button>
        </FlexBox>
      </WizardStep>
    </Wizard>
  );
};

export default EventlogConfig;
