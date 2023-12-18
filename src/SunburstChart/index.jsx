import { colors } from '../util';
import EchartsComponent from 'echarts-for-react';

const SunburstChart = ({ sunburstData, setRightClickInfo, setDialogIsOpen }) =>
  sunburstData ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '100%',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        {colors.map(({ color, text }) => (
          <span
            key={color}
            style={{
              padding: 8,
              backgroundColor: color,
              width: 100,
              height: 50,
              display: 'inline-block',
              color: 'black',
              textAlign: 'center',
              fontSize: 12,
            }}
          >
            {text}
          </span>
        ))}
        <span
          key={'white'}
          style={{
            padding: 8,
            backgroundColor: 'white',
            width: 100,
            height: 50,
            display: 'inline-block',
            color: 'black',
            textAlign: 'center',
            fontSize: 12,
          }}
        >
          select event on right-click
        </span>
      </div>
      <div
        style={{
          padding: '0 9px 9px',
          width: 800,
          height: 800,
          margin: 20,
        }}
      >
        <EchartsComponent
          onEvents={{
            contextmenu: ({ data, event }) => {
              event.event.preventDefault();
              setRightClickInfo({
                name: data.name,
                reason: data.reason,
              });
              setDialogIsOpen(true);
            },
          }}
          style={{
            padding: '0 9px 9px',
            width: '100%',
            height: '100%',
          }}
          option={sunburstData ? sunburstData : []}
          lazyUpdate
          notMerge
        />
      </div>
    </div>
  ) : null;

export default SunburstChart;
