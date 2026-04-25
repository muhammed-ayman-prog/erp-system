const branchOrder = [
  "Abbas Akkad 1",
  "Abbas Akkad 2",
  "Abbas Akkad 3",
  "City Stars",
  "El Obour",
  "El Rehab"
];

export const sortBranches = (branches) => {
  return [...branches].sort((a, b) => {
    const indexA = branchOrder.indexOf(a);
    const indexB = branchOrder.indexOf(b);

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
};