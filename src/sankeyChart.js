import EchartsComponent from 'echarts-for-react';

function reduceToSankeyArray(inputData) {
  const data = [];
  const links = [];

  inputData.map((entry, index) => {
    const eventCount = entry[entry.length - 1];
    const nodes = entry.slice(0, -1); // Exclude the last element (count)

    for (let i = 0; i < nodes.length - 1; i++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[i + 1];

      if (!data.find((x) => x.name === sourceNode + index + i)) {
        data.push({ name: sourceNode + index + i });
      }

      if (!data.find((x) => x.name === targetNode + index + i)) {
        data.push({ name: targetNode + index + i });
      }

      const existingLink = links.find(
        (x) => x.source === sourceNode && x.target === targetNode
      );

      if (existingLink) {
        existingLink.value += eventCount;
      } else {
        links.push({
          source: sourceNode + index + i,
          target: targetNode + index + i,
          value: eventCount,
        });
      }
    }
  });
  // Consolidate links with the same source and target nodes
  const consolidatedLinks = [];
  links.forEach((link) => {
    const existingConsolidatedLink = consolidatedLinks.find(
      (x) => x.source === link.source && x.target === link.target
    );

    if (existingConsolidatedLink) {
      existingConsolidatedLink.value += link.value;
    } else {
      consolidatedLinks.push({ ...link });
    }
  });

  return { data, links: consolidatedLinks };
}

export const Sankey = (data2) => {
  const sankeyItems = reduceToSankeyArray(data2);
  const defaultOptionsSankey = {
    series: {
      layout: 'none',
      emphasis: {
        focus: 'adjacency',
      },
      type: 'sankey',
      data: sankeyItems.data,
      links: sankeyItems.links,
      locale: 'EN-US',
    },
  };

  return (
    <EchartsComponent
      style={{
        height: 1000,
        width: 1000,
      }}
      option={defaultOptionsSankey}
      lazyUpdate
      notMerge
    />
  );
};
