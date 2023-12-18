import { useState } from 'react';
import {
  Timeline,
  TimelineItem,
  FlexBox,
  Card,
  ToolbarSelect,
  ToolbarSelectOption,
  Text,
  CardHeader,
  Button,
  ToolbarV2,
  ToolbarButton,
} from '@ui5/webcomponents-react';
import { isNil, find, isEqual } from 'lodash';

const findColor = (level) => {
  switch (level) {
    case 'faulty':
      return '#FF0000';
    case 'partlyFaulty':
      return '#FFBF00';
    case false:
      return '#008000';
    default:
      return 'yellow';
  }
};

const EventVariantsDisplay = ({
  newData,
  setRightClickInfo,
  setDialogIsOpen,
  setVariantData,
  originalVariantData,
  variantData,
}) => {
  const [showOnlyNonConformant, setShowOnlyNonConformant] = useState(false);

  const chartData = newData
    ?.map(({ events, measure, isFaulty, faultyEventsFromVariant }) => {
      return {
        events: events?.map((event) => {
          const faultyEvent = find(faultyEventsFromVariant, {
            faultyEvent: event,
          });
          return {
            eventName: event,
            reason: !isNil(faultyEvent) ? faultyEvent.reason : [],
            level: !isNil(faultyEvent) ? faultyEvent.level : isFaulty,
          };
        }),
        measure,
        isFaulty,
      };
    })
    .sort((a, b) => b.measure - a.measure)
    .filter(({ isFaulty }) => {
      if (showOnlyNonConformant) {
        return isFaulty;
      }
      return true;
    });

  return (
    <>
      <ToolbarV2
        alignContent={{
          End: 'End',
          Start: 'Start',
        }}
      >
        <ToolbarSelect
          onChange={() => {
            setShowOnlyNonConformant(!showOnlyNonConformant);
          }}
        >
          <ToolbarSelectOption selected={!showOnlyNonConformant}>
            Show all
          </ToolbarSelectOption>
          <ToolbarSelectOption selected={showOnlyNonConformant}>
            Show only non-conformant
          </ToolbarSelectOption>
        </ToolbarSelect>
        <ToolbarButton
          onClick={() => setVariantData(originalVariantData)}
          text=" Reset Variants"
        />
      </ToolbarV2>

      <div
        style={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          height: '100%',
        }}
      >
        {chartData.map((variant, index) => (
          <div key={index}>
            <Card
              header={
                <CardHeader
                  style={{ color: 'black' }}
                  titleText={`Occurrence: ${variant.measure}`}
                />
              }
              style={{
                width: '95%',
                margin: '8px',
                minHeight: 50,
              }}
            >
              <FlexBox
                key={index}
                style={{
                  height: 200,
                  padding: 5,
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                <Timeline layout="Horizontal">
                  {variant.events.map((event, eventIndex) => (
                    <TimelineItem
                      nameClickable
                      onNameClick={() => {
                        setRightClickInfo(event);
                        setDialogIsOpen(true);
                      }}
                      name={event.eventName}
                      key={eventIndex}
                      style={{
                        width: 200,
                        margin: '8px',
                        background: findColor(event.level),
                      }}
                    />
                  ))}
                </Timeline>
              </FlexBox>
              <FlexBox
                style={{
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  icon="delete"
                  style={{ margin: 10 }}
                  onClick={() => {
                    setVariantData(
                      variantData.filter(
                        (y) =>
                          !isEqual(
                            y,
                            [
                              variant.events.map((x) => x.eventName),
                              variant.measure,
                            ].flat()
                          )
                      )
                    );
                  }}
                >
                  Delete Variant
                </Button>
              </FlexBox>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};

export default EventVariantsDisplay;
