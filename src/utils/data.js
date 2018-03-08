export function parse(rawData) {
  const [rows, columns, numCars, numRides, bonus, steps] = rawData[0];

  const rideData = rawData.slice(1).map((sourceRow, index) => {
    const [startRow, startCol, endRow, endCol, earliestStart, latestEnd] = sourceRow;
    return {
      index,
      start: {
        row: startRow,
        col: startCol,
      },
      end: {
        row: endRow,
        col: endCol,
      },
      earliestStart,
      latestEnd,
      car: -1,
    }
  });

  return {
    rows,
    columns,
    numCars,
    numRides,
    bonus,
    steps,
    rideData,
  };
}