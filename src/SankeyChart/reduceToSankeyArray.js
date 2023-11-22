import { uniqBy } from 'lodash';

export default (inputData) => {
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
