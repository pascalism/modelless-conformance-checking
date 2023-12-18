import {
  Timeline,
  TimelineItem,
  FlexBox,
  Card,
  CardHeader,
  Button,
} from '@ui5/webcomponents-react';
import { isNil, find } from 'lodash';

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
    .sort((a, b) => b.measure - a.measure);

  return (
    <>
      <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', height: '100%' }}>
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
                  icon="add"
                  style={{ margin: 10 }}
                  onClick={() => {
                    setVariantData([
                      ...variantData,
                      [
                        variant.events.map((x) => x.eventName),
                        variant.measure,
                      ].flat(),
                    ]);
                  }}
                >
                  Restore Variant
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
