import { Button, Title } from '@ui5/webcomponents-react';
import { colors } from '../util';
import EchartsComponent from 'echarts-for-react';

const SunburstChart = ({ sunburstData, setRightClickInfo, setDialogIsOpen }) =>
  sunburstData ? (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title style={{ width: 300 }}>(select event on right-click)</Title>
        {colors.map(({ color, text }) => (
          <span
            key={color}
            style={{
              padding: 8,
              backgroundColor: color,
              width: '200px',
              height: '50px',
              display: 'inline-block',
              color: 'black',
              textAlign: 'center',
            }}
          >
            {text}
          </span>
        ))}
        <Button design="Transparent" icon="full-screen" />
      </div>

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
          height: 800,
          width: 800,
        }}
        option={sunburstData ? sunburstData : []}
        lazyUpdate
        notMerge
      />
    </>
  ) : null;

export default SunburstChart;
