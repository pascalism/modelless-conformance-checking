import { SegmentedButtonItem, SegmentedButton } from '@ui5/webcomponents-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ChartBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <SegmentedButton mode="SingleSelect">
        <SegmentedButtonItem
          active={pathname === '/sunburst'}
          icon="donut-chart"
          onClick={() => navigate('/sunburst')}
        >
          Sunburst Chart
        </SegmentedButtonItem>
        <SegmentedButtonItem
          active={pathname === '/variants'}
          icon=""
          onClick={() => navigate('/variants')}
        >
          Variant Explorer
        </SegmentedButtonItem>
        <SegmentedButtonItem
          active={pathname === '/sankey'}
          icon="opportunity"
          onClick={() => navigate('/sankey')}
        >
          Sankey Chart
        </SegmentedButtonItem>
        <SegmentedButtonItem
          active={pathname === '/table'}
          icon="table-view"
          onClick={() => navigate('/table')}
        >
          Table View
        </SegmentedButtonItem>
      </SegmentedButton>
    </div>
  );
};

export default ChartBar;
