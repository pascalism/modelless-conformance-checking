import { useState } from 'react';
import {
  Timeline,
  TimelineItem,
  FlexBox,
  Card,
  Switch,
  Label,
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
}) => {
  const [showOnlyNonConformant, setShowOnlyNonConformant] = useState(false);
  console.log(showOnlyNonConformant);
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
      <Label>Only show non-conformant variants</Label>
      <Switch
        onChange={() => setShowOnlyNonConformant(!showOnlyNonConformant)}
        style={{ paddingTop: 20, paddingLeft: 30 }}
      />
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
                      minHeight: 50,
                      background: findColor(event.level),
                    }}
                  />
                ))}
              </Timeline>
            </FlexBox>
          </>
        ))}
      </div>
    </>
  );
};

export default EventVariantsDisplay;
