import { info } from './utils/log';
import { parse } from './utils/data';
import { getFilesInFolder, readIn, writeOut } from './utils/file';
import { simulate } from './simulation/simple';
import { pickNextRide } from './algorithm/lookahead';

// const files = getFilesInFolder('./data');
const files = ['./data/b_should_be_easy.in'];
// const files = ['./data/c_no_hurry.in'];
// const files = ['./data/d_metropolis.in'];
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
    lookahead: 1,
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
