import {
  Timeline,
  TimelineItem,
  FlexBox,
  Card,
} from '@ui5/webcomponents-react';
import { isNil, find } from 'lodash';

const findColor = (level) => {
  switch (level) {
    case 'faulty':
      return '#FF0000';
    case 'partly faulty':
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
    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', height: 500 }}>
      {chartData.map((variant, index) => (
        <>
          <Card
            style={{
              width: 150,
              margin: '8px',
              minHeight: 50,
            }}
          >
            Occurrence: {variant.measure}
          </Card>
          <FlexBox
            key={index}
            style={{ marginBottom: '16px', height: 200, padding: 5 }}
          >
            <Timeline layout="Horizontal">
              {variant.events.map(({ eventName, level }, eventIndex) => (
                <TimelineItem
                  nameClickable
                  onNameClick={() => {
                    setRightClickInfo({});
                    setDialogIsOpen(true);
                  }}
                  name={eventName}
                  key={eventIndex}
                  style={{
                    width: 200,
                    margin: '8px',
                    minHeight: 50,
                    background: findColor(level),
                  }}
                />
              ))}
            </Timeline>
          </FlexBox>
        </>
      ))}
    </div>
  );
};

export default EventVariantsDisplay;
