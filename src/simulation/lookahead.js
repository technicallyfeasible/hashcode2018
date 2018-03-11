import { map } from 'lodash';

import { debug, error } from '../utils/log';
import { distance, move, equals } from '../utils/vector';
import { calculatePoints } from '../utils/points';


const modes = {
  EMPTY: 'EMPTY',
  MOVE_TO_START: 'MOVE_TO_START',
  MOVE_TO_END: 'MOVE_TO_END',
  WAITING: 'WAITING',
};

/**
 * Add the duration of ride to the total and return it
 * @param agg {{ time, position }}
 * @param position
 * @param ride
 */
function addRideDuration(agg, ride) {
  const { time, position } = agg;
  const distanceToRide = distance(position, ride.start);

  // return total +
}

export function simulate(parsedData, options) {
  const {
    numCars,
    numRides,
    steps,
    bonus,
    rideData,
  } = parsedData;

  const {
    pickNextRide,
    // how many rides to get additionally
    lookahead = 0,
  } = options;

  const cars = map(Array(numCars), () => ({
    position: {
      row: 0,
      col: 0,
    },
    mode: modes.EMPTY,
    curRide: null,
    rides: [],
    nextRides: [],
  }));

  let totalPoints = 0;

  let nextRideDelta = 0;
  let time = 0;
  while (time < steps) {
    nextRideDelta = null;

    let ridesDone = 0;

    cars.forEach((car, carIndex) => {
      const { position, rides, nextRides } = car;
      let { mode, curRide } = car;

      if (!curRide) {
        while(nextRides.length < lookahead + 1) {
          let nextTime;
          let nextPosition;
          // choose either the car's current position or the ending position of the last ride in the list
          if (nextRides.length > 0) {
            nextTime = nextRides.reduce(addRideDuration, { time, position });
            nextPosition = nextRides[nextRides.length - 1].end;
          } else {
            nextTime = time;
            nextPosition = position;
          }
          const ride = pickNextRide(carIndex, nextTime, nextPosition, parsedData);
          nextRides.push(ride);
        }

        let nextRide;
        if (car.nextRides.length > 0) {
          nextRide = car.nextRides.shift();
        }
        const nextRide = pickNextRide(carIndex, time, position, parsedData);
        if (nextRide) {
          debug(time, carIndex, 'Ride:', nextRide.index);
          curRide = nextRide;
          mode = modes.MOVE_TO_START;
          car.rides.push(nextRide.index);
          const points = calculatePoints(time, position, nextRide, parsedData);
          debug(time, carIndex, 'Points:', nextRide.index, points);
          totalPoints += points;
        } else {
          // no more rides
          ridesDone += rides.length;
          return;
        }
      }

      const { start, end, earliestStart } = curRide;

      let delta;
      switch (mode) {
        case modes.MOVE_TO_START:
          delta = distance(position, start);
          break;
        case modes.WAITING:
          delta = Math.max(0, earliestStart - time);
          break;
        case modes.MOVE_TO_END:
          delta = distance(position, end);
          break;
      }

      if (nextRideDelta === null || delta < nextRideDelta) {
        nextRideDelta = delta;
      }
      debug(time, carIndex, 'Delta:', delta, position, nextRideDelta);

      car.curRide = curRide;
      car.mode = mode;
    });

    cars.forEach((car, carIndex) => {
      let { mode, position, curRide } = car;
      if (!curRide) return;

      const { start, end, earliestStart } = curRide;

      switch (mode) {
        case modes.MOVE_TO_START:
          debug(time, carIndex, 'Move:', mode, position, start, nextRideDelta);
          position = move(position, start, nextRideDelta);
          if (equals(position, start)) {
            mode = time < earliestStart ? modes.WAITING : modes.MOVE_TO_END;
          }
          break;
        case modes.WAITING:
          debug(time, carIndex, 'Wait:', earliestStart - (time + nextRideDelta));
          if (time + nextRideDelta >= earliestStart) {
            mode = modes.MOVE_TO_END;
          }
          break;
        case modes.MOVE_TO_END:
          debug(time, carIndex, 'Move:', mode, position, end, nextRideDelta);
          position = move(position, end, nextRideDelta);
          if (equals(position, end)) {
            mode = modes.EMPTY;
            curRide = null;
          }
          break;
        default:
          error('Unexpected mode', mode);
          break;
      }

      car.position = position;
      car.curRide = curRide;
      car.mode = mode;
    });

    time += nextRideDelta;
    debug('Time:', time, nextRideDelta);

    if (ridesDone >= numRides) {
      break;
    }
  }

  const maxPoints = rideData.reduce((points, ride) => {
    return points + bonus + distance(ride.start, ride.end);
  }, 0);

  return {
    cars,
    totalPoints,
    maxPoints,
  };
}
