import { info } from './utils/log';
import { parse } from './utils/data';
import { getFilesInFolder, readIn, writeOut } from './utils/file';
import { simulate } from './simulation/lookahead';
import { pickNextRide } from './algorithm/naive';

// const files = getFilesInFolder('./data');
// const files = ['./data/a_example.in'];
// const files = ['./data/b_should_be_easy.in'];
// const files = ['./data/c_no_hurry.in'];
const files = ['./data/d_metropolis.in'];
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

  const start = Date.now();

  const result = simulate(parsedData, {
    pickNextRide,
    lookahead: 0,
    anxiety: steps / 100,
  });

  const duration = (Date.now() - start);
  info('Duration:', `${(duration / 1000).toFixed(1)}s`);

  const { totalPoints, maxPoints, cars } = result;

  info('Points:', totalPoints, '/', maxPoints);
  overallPoints += totalPoints;
  overallMaxPoints += maxPoints;

  const outName = `${filename.substring(0, filename.lastIndexOf('.'))}.out`;
  info('Writing', outName, '\n');
  writeOut(outName, cars);
});

info('Total points:', overallPoints, '/', overallMaxPoints);
