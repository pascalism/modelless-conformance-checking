import { Button, Bar } from '@ui5/webcomponents-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ChartBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <Bar
      style={{ marginBottom: 20 }}
      startContent={
        <Button
          active={pathname === '/sunburst'}
          icon="donut-chart"
          onClick={() => navigate('/sunburst')}
        >
          Sunburst
        </Button>
      }
      endContent={
        <Button
          active={pathname === '/sankey'}
          icon="opportunity"
          onClick={() => navigate('/sankey')}
        >
          Sankey
        </Button>
      }
    >
      <span>
        <Button
          active={pathname === '/table'}
          icon="table-view"
          onClick={() => navigate('/table')}
        >
          Table View
        </Button>
      </span>
    </Bar>
  );
};

export default ChartBar;
