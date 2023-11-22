import { Button, Title } from '@ui5/webcomponents-react';
import EchartsComponent from 'echarts-for-react';

const SunburstChart = ({
  sunburstData,
  setRightClickInfo,
  setDialogIsOpen,
}) => {
  const colors = ['green', 'yellow', 'orange', 'red'];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>(select event on right-click)</Title>
        <Button design="Transparent" icon="full-screen" />
      </div>
      <ul>
        {colors.map((color, index) => (
          <li key={index}>
            <span
              style={{
                backgroundColor: color,
                width: '20px',
                height: '20px',
                display: 'inline-block',
                marginRight: '5px',
              }}
            />
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </li>
        ))}
      </ul>
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
  );
};

export default SunburstChart;
