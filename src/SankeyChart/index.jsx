import { isNil, isEmpty, find, indexOf, uniqBy, tail } from 'lodash';
import { Button, Title } from '@ui5/webcomponents-react';
import Plot from 'react-plotly.js';

const SankeyChart = ({
  setRightClickInfo,
  faultyEvents,
  data2,
  setDialogIsOpen,
}) => {
  const reduceToSankeyArray = (inputData) => {
    const data = [];
    const links = [];

    inputData.map((entry, index) => {
      const eventCount = entry[entry.length - 1];
      const nodes = entry.slice(0, -1); // Exclude the last element (count)

      for (let i = 0; i < nodes.length - 1; i++) {
        const sourceNode = nodes[i];
        const targetNode = nodes[i + 1];

        if (!data.find((x) => x.name === sourceNode + index + i)) {
          data.push({ name: sourceNode });
        }

        if (!data.find((x) => x.name === targetNode + index + i)) {
          data.push({ name: targetNode });
        }

        const existingLink = links.find(
          (x) => x.source === sourceNode && x.target === targetNode
        );

        if (existingLink) {
          existingLink.value += eventCount;
        } else {
          links.push({
            source: sourceNode,
            target: targetNode,
            value: eventCount,
          });
        }
      }
    });
    // Consolidate links with the same source and target nodes
    const consolidatedLinks = [];
    links.map((link) => {
      const existingConsolidatedLink = consolidatedLinks.find(
        (x) => x.source === link.source && x.target === link.target
      );

      if (existingConsolidatedLink) {
        existingConsolidatedLink.value += link.value;
      } else {
        consolidatedLinks.push({ ...link });
      }
    });

    return { data: uniqBy(data, 'name'), links: consolidatedLinks };
  };
  const { data, links } = reduceToSankeyArray(data2);

  const { source, target, value } = links
    .map((x) => [
      indexOf(
        data.map((x) => x.name),
        x.source
      ),
      indexOf(
        data.map((x) => x.name),
        x.target
      ),
      x.value,
    ])
    .reduce(
      ({ source, target, value }, current) => ({
        source: [...source, current[0]],
        target: [...target, current[1]],
        value: [...value, current[2]],
      }),
      { source: [], target: [], value: [] }
    );

  return (
    <>
      <div>
        <Title>(select event on click)</Title>
        <Button design="Transparent" icon="full-screen" />
      </div>
      <Plot
        onClick={({ points }) => {
          if (isNil(points[0]?.customdata)) {
            return;
          }
          setRightClickInfo({
            name: points[0].label,
            reason: tail(points[0].customdata.split('<br>'))
              .filter((x) => !isEmpty(x))
              .map((x) => ({
                reason: x,
                obs_id: find(
                  find(faultyEvents, { faultyEvent: points[0].label })?.reason,
                  { reason: x }
                )?.obs_id,
              })),
          });
          setDialogIsOpen(true);
        }}
        data={[
          {
            type: 'sankey',
            orientation: 'h',
            arrangement: 'fixed',
            node: {
              pad: 15,
              thickness: 30,
              line: {
                color: 'black',
                width: 0.5,
              },
              customdata: data.map((dataPoint) => {
                const faultyEvent = find(uniqBy(faultyEvents, 'faultyEvent'), {
                  faultyEvent: dataPoint.name,
                });
                if (!isNil(faultyEvent)) {
                  return (
                    dataPoint.name +
                    '<br>' +
                    faultyEvent.reason
                      ?.map((dataPoint) => dataPoint.reason)
                      .join('<br>') +
                    '<br>'
                  );
                }
                return dataPoint.name + '<br>';
              }),
              metadata: data,
              hovertemplate:
                '%{customdata} <b></b>occurred: %{value} times<extra></extra>',
              label: data.map((x) => x.name),
              color: data.map((x) => {
                const a = find(uniqBy(faultyEvents, 'faultyEvent'), {
                  faultyEvent: x.name,
                });
                if (!isNil(a)) {
                  return a.level === 'faulty' ? 'red' : 'yellow';
                }
                return 'green';
              }),
            },

            link: {
              source,
              target,
              value,
            },
          },
        ]}
        layout={{
          width: 1200,
          height: 800,
          title: 'Sankey Plot of Events',
          tooltip: {
            // Edit the tooltip here
            text: 'Tooltip title',
          },
        }}
      />
      <br />
    </>
  );
};

export default SankeyChart;
