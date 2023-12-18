import { colors } from '../util';
import EchartsComponent from 'echarts-for-react';

const SunburstChart = ({ sunburstData, setRightClickInfo, setDialogIsOpen }) =>
  sunburstData ? (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: 20,
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <EchartsComponent
          onEvents={{
            contextmenu: ({ data, event }) => {
              console.log(data);
              event.event.preventDefault();
              setRightClickInfo({
                name: data.name,
                reason: data.reason,
              });
              setDialogIsOpen(true);
            },
          }}
          style={{
            height: 800,
            width: 800,
          }}
          option={sunburstData ? sunburstData : []}
          lazyUpdate
          notMerge
        />
      </div>
    </div>
  ) : null;

export default SunburstChart;
