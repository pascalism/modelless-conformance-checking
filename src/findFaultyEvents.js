import { isNil, indexOf, find } from 'lodash';
import { replaceAt } from './util';

export const findFaultyEventFromFaultyEventsArray = (
  event,
  faultyEventsArray
) => {
  return faultyEventsArray.reduce((acc, current) => {
    // actually contained
    if (current.eventName === event) {
      return [
        ...acc,
        {
          faultyEvent: event,
          reason: current.reason,
          level: 'faulty',
        },
      ];
    }
    // partly contained
    const partlyContainedEvents = event
      .split(' ')
      ?.reduce((acc, currentEventNameSplit) => {
        if (current.eventName === currentEventNameSplit) {
          return [
            ...acc,
            {
              faultyEvent: event,
              reason: current.reason,
              level: 'partlyFaulty',
            },
          ];
        }
        return acc;
      }, []);
    return [...acc, ...partlyContainedEvents];
  }, []);
};

export const reduceFaultyEventsArray = (acc, currentRow) => {
  const a = find(acc, { eventName: currentRow.left_op });
  if (!isNil(a)) {
    return replaceAt(acc, indexOf(acc, a), {
      eventName: currentRow.left_op,
      reason: !isNil(a)
        ? [
            ...a.reason,
            {
              reason: currentRow.nat_lang_template,
              obs_id: currentRow.obs_id,
            },
          ]
        : [
            {
              reason: currentRow.nat_lang_template,
              obs_id: currentRow.obs_id,
            },
          ],
    });
  }
  return [
    ...acc,
    {
      eventName: currentRow.left_op,
      reason: [
        {
          reason: currentRow.nat_lang_template,
          obs_id: currentRow.obs_id,
        },
      ],
    },
  ];
};
