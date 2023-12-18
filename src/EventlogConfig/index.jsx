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
  Link,
} from '@ui5/webcomponents-react';
import { objectMap } from '../util';
import SuggestedConstraintsTable from '../SuggestedConstraintsTable';
import ViolatedConstraintsTable from '../ViolatedConstraintsTable';
import variant_array_short from '../variant_array_short';
import variant_array_salesforce from '../variant_array_salesforce';
import variant_array_bpichallenge from '../variant_array_bpichallenge';
import fetchFile from '../fetchFile';
import { differenceWith } from 'lodash';
import ButtonMenu from '../ButtonMenu';

const EventlogConfig = ({
  setVariantData,
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
  setOriginalVariantData,
  setCsvRecommendationData,
  setCsvResultData,
  unmappedData,
}) => {
  const [selectedWizard, setSelectedWizard] = useState({
    1: { selected: true, disabled: false },
    2: { selected: false, disabled: false }, // change to disabled: true
    3: { selected: false, disabled: false }, // change to disabled: true
  });

  const [selectedFile, setSelectedFile] = useState({});
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
    switch (selectedFile) {
      case 'Test Log':
        fetchFile(
          setCsvRecommendationData,
          'runningexample.xes-recommended_constraintsv_newcolumn.csv'
        );
        fetchFile(
          setCsvResultData,
          'runningexample.xes-violations_newcolumn.csv'
        );
        setVariantData(variant_array_short);
        setOriginalVariantData(variant_array_short);
        return;
      case 'Salesforce Log':
        fetchFile(
          setCsvRecommendationData,
          'borodoro_2_0-events.pkl-recommended_constraints.csv'
        );
        fetchFile(
          setCsvResultData,
          'borodoro_2_0-events.pkl-violations_lesscolumns.csv'
        );
        setVariantData(variant_array_salesforce);
        setOriginalVariantData(variant_array_salesforce);
        return;
      case 'BPI Challenge Log':
        fetchFile(
          setCsvRecommendationData,
          'BPI_Challenge_2019-3-w-after.xes-recommended_constraints_newcolumns.csv'
        );
        fetchFile(
          setCsvResultData,
          'BPI_Challenge_2019-3-w-after.xes-violations_newcolumns.csv'
        );
        setVariantData(variant_array_bpichallenge);
        setOriginalVariantData(variant_array_bpichallenge);
        return;
      default:
        return;
    }
  }, [
    selectedFile,
    setCsvRecommendationData,
    setCsvResultData,
    setVariantData,
    setOriginalVariantData,
  ]);

  const handleStepChange = (e) => {
    setSelectedWizard({
      ...objectMap(selectedWizard, (x) => ({
        selected: false,
        disabled: x.disabled,
      })),
      [e.detail.step.dataset.step]: { selected: true, disabled: false },
    });
  };
  const menuActions = {
    reset: () => setResultData(originalResultData),
    unmapped: () => navigate('/unmapped-constraints-table'),
    diff: () => navigate('/deleted-constraints-table'),
    deleteUnmapped: () =>
      setResultData(
        differenceWith(
          resultData,
          unmappedData,
          (x, y) => x.obs_id === y.obs_id
        )
      ),
  };
  const menuItems = [
    { icon: 'reset', text: 'Reset Violated Constraints', key: 'reset' },
    { icon: 'opportunity', text: 'Show Deleted Constraints', key: 'diff' },
    { icon: 'opportunity', text: 'Show Unmapped', key: 'unmapped' },
    { icon: 'delete', text: 'Delete Unmapped', key: 'deleteUnmapped' },
  ];

  return (
    <Wizard
      onStepChange={(all) => handleStepChange(all)}
      contentLayout="SingleStep"
      style={{ height: '100%', width: '100%' }}
    >
      <WizardStep
        icon="product"
        titleText="Event log Upload"
        disabled={selectedWizard['1'].disabled}
        selected={selectedWizard['1'].selected}
        data-step={'1'}
      >
        <>
          <Title>1. Event log Upload</Title>
          <Label wrappingType={WrappingType.Normal}>
            Theoretically, here you would upload an Event log file to perform a
            modelless conformance check. Since this is currently a static
            application, you may choose between the pre-configured event logs.
            <br />
            The user flow follows the input and output of{' '}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={'https://github.com/signavio/best-practice-conformance'}
            >
              https://github.com/signavio/best-practice-conformance
            </Link>
            .
          </Label>
          <br />
          <FileUploader hideInput style={{ margin: 20 }}>
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
                text: 'Select Here',
                value: '',
              },
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
                value: 'bpi_log',
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
          <div style={{ margin: 200 }} />
          <FlexBox justifyContent="SpaceBetween">
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
            <Button icon="opportunity" onClick={() => navigate('/sunburst')}>
              Jump to Visualization
            </Button>
          </FlexBox>
        </>
      </WizardStep>
      <WizardStep
        icon="hint"
        titleText="Configure Suggested Constraints"
        disabled={selectedWizard['2'].disabled}
        selected={selectedWizard['2'].selected}
        data-step={'2'}
      >
        <Title>2. Configure Suggested Constraints</Title>
        <Label wrappingType={WrappingType.Normal}>
          Here, you can filter constraints that may not be interesting for your
          further conformance checking. Since this is still a static
          application, this would not have an impact on the generated
          constraints currently.
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
        <div style={{ margin: 10 }} />
        <FlexBox justifyContent="SpaceBetween">
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
            Jump to Visualization
          </Button>
        </FlexBox>
      </WizardStep>
      <WizardStep
        icon="lead"
        titleText="Violated Constraints"
        disabled={selectedWizard['3'].disabled}
        selected={selectedWizard['3'].selected}
        data-step={'3'}
      >
        <Title>3. Violated Constraints</Title>
        <Label wrappingType={WrappingType.Normal}>
          This is your first interaction with the violated constraints. You can
          pre-filter them based on the given attributes to enhance your
          conformance checking investigation.
        </Label>
        <ButtonMenu actions={menuActions} items={menuItems} />
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
        <FlexBox justifyContent="End">
          <Button icon="opportunity" onClick={() => navigate('/sunburst')}>
            Continue to Visualization
          </Button>
        </FlexBox>
      </WizardStep>
    </Wizard>
  );
};

export default EventlogConfig;
