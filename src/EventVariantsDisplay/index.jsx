import { useState } from 'react';
import {
  Timeline,
  TimelineItem,
  FlexBox,
  Card,
  ToolbarSelect,
  ToolbarSelectOption,
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
  showOnlyNonConformant,
  setShowOnlyNonConformant,
  newData,
  setRightClickInfo,
  setDialogIsOpen,
  setVariantData,
  originalVariantData,
  variantData,
}) => {
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
          onChange={(x) => {
            console.log(
              x.detail.selectedOption.innerText === 'Show only non-conformant'
            );
            setShowOnlyNonConformant(
              x.detail.selectedOption.innerText === 'Show only non-conformant'
            );
            if (
              x.detail.selectedOption.innerText === 'Show only non-conformant'
            ) {
              setVariantData(
                chartData
                  .filter((x) => x.isFaulty)
                  .map((x) => [...x.events.map((x) => x.eventName), x.measure])
              );
            } else {
              setVariantData(originalVariantData);
            }
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
          onClick={() => {
            setVariantData(originalVariantData);
            setShowOnlyNonConformant(false);
          }}
          text=" Reset Variants"
        />
      </ToolbarV2>

      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          //   border: '1px solid #ccc',
          padding: '10px',
        }}
      >
        {chartData.map((variant, index) => (
          <div key={index}>
            <Card
              header={
                <FlexBox justifyContent="SpaceBetween">
                  <CardHeader
                    style={{ color: 'black' }}
                    titleText={`Occurrence: ${variant.measure}, # of Events: ${variant.events.length}`}
                  />

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
              }
              style={{
                width: '95%',
                margin: '8px',
                // minHeight: 100,
              }}
            >
              <FlexBox
                key={index}
                style={{
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
                        setRightClickInfo({
                          name: event.eventName,
                          reason: event.reason,
                        });
                        setDialogIsOpen(true);
                      }}
                      label={event.eventName}
                      name={event.eventName}
                      aria-label={event.eventName}
                      title={event.eventName}
                      key={eventIndex}
                      style={{
                        width: 200,
                        height: 80,
                        background: findColor(event.level),
                      }}
                    />
                  ))}
                </Timeline>
              </FlexBox>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};

export default EventVariantsDisplay;
