import { info } from './utils/log';
import { parse } from './utils/data';
import { getFilesInFolder, readIn, writeOut } from './utils/file';
import { simulate } from './simulation';
import { pickNextRide } from './algorithm/naive';

// const files = getFilesInFolder('./data_extended');
const files = ['./data_extended/b_should_be_easy.in'];
let overallPoints = 0;
let overallMaxPoints = 0;

files.forEach(filename => {
  info('Reading', filename);
  const data = readIn(filename);

  const parsedData = parse(data);
  const {
    numCars,
    numRides,
    bonus,
    steps,
  } = parsedData;

  console.log('Cars:', numCars);
  console.log('Rides:', numRides);
  console.log('Bonus:', bonus);
  console.log('Steps:', steps);

  const result = simulate(parsedData, {
    pickNextRide,
  });

  const { totalPoints, maxPoints, cars } = result;

  info('Points:', totalPoints, '/', maxPoints);
  overallPoints += totalPoints;
  overallMaxPoints += maxPoints;

  const outName = `${filename.substring(0, filename.lastIndexOf('.'))}.out`;
  info('Writing', outName, '\n');
  writeOut(outName, cars);
});

info('Total points:', overallPoints, '/', overallMaxPoints);
