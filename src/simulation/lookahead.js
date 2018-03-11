import { map } from 'lodash';

import { info, debug, error } from '../utils/log';
import { distance, move, equals } from '../utils/vector';
import {
  calculatePoints,
  calculatePointsForAll,
  advanceRide,
  removeRide,
  getLocationAtRideFinish,
} from '../utils/points';


const modes = {
  EMPTY: 'EMPTY',
  MOVE_TO_START: 'MOVE_TO_START',
  MOVE_TO_END: 'MOVE_TO_END',
  WAITING: 'WAITING',
};

export function simulate(parsedData, options) {
  const {
    numCars,
    numRides,
    steps,
    bonus,
    rideData,
  } = parsedData;

  const remainingRides = rideData.map(ride => ({ ...ride }));
  const context = {
    ...parsedData,
    rideData: remainingRides,
  };

  const {
    pickNextRide,
    // how many steps to look ahead
    lookahead = 0,
    // how many steps to look ahead to make sure we don't lose rides
    anxiety,
  } = options;
  const extraSteps = Math.round(lookahead);
  const anxietySteps = typeof anxiety !== 'number' ? extraSteps : Math.round(anxiety);
  info('Lookahead:', extraSteps);
  info('Anxiety:', anxietySteps);

  const cars = map(Array(numCars), () => ({
    position: {
      row: 0,
      col: 0,
    },
    mode: modes.EMPTY,
    curRide: null,
    rides: [],
    nextRides: [],
    nextFinish: {
      position: {
        row: 0,
        col: 0,
      },
      time: 0,
    },
  }));

  let totalPoints = 0;
  let missedRidesCount = 0;
  let missedRidesPoints = 0;
  let notSavedRidesCount = 0;
  let savedRidesCount = 0;

  const ridesToRemove = [];
  let maxNextRides = 0;

  let nextRideDelta = 0;
  let time = 0;
  while (time < steps) {
    nextRideDelta = null;

    let ridesDone = 0;
    // removeRide(context.rideData, ridesToRemove);
    // let ridesChanged = ridesToRemove.length > 0;
    // ridesToRemove.length = 0;

    // loop over all cars and add the next ride until no more rides can be assigned
    // this is so we don't favour any particular car and distribute the rides better
    let needRides;
    do {
      needRides = false;
      cars.forEach((car, carIndex) => {
        const { nextRides } = car;
        let { nextFinish } = car;

        // check whether this car is done
        debug(time, carIndex, 'Finish:', nextFinish.time, time + extraSteps);
        if (nextFinish.time >= time + extraSteps) {
          return;
        }

        const { time: nextTime, position: nextPosition } = nextFinish;
        const ride = pickNextRide(nextTime, nextPosition, context);
        // no more rides available so just stop
        if (!ride) {
          return;
        }

        nextFinish = advanceRide(nextFinish, ride);
        debug(time, carIndex, 'Next:', ride.index, nextFinish);
        // mark the ride as taken
        ride.car = carIndex;
        nextRides.push(ride);
        car.nextFinish = nextFinish;

        ridesToRemove.push(ride.index);

        // indicate we need to loop again
        needRides = true;
      });
    } while (needRides);

    // removeRide(context.rideData, ridesToRemove);
    // ridesChanged = ridesChanged || ridesToRemove.length > 0;
    // ridesToRemove.length = 0;

    // if (ridesChanged) {
      // look for all rides that would finish in time + extraSteps and have not been assigned a car
      const missedRides = remainingRides.reduce((rides, ride) => {
        if (!ride.car && ride.latestEnd > time && ride.latestEnd < time + anxietySteps) {
          rides.push(ride);
        }
        return rides;
      }, []);
      if (missedRides.length > 0) {
        // check whether any car can still take one of the missing ones
        missedRides.forEach(ride => {
          // add the missed ride into each car's next ride array and calculate the points up to that ride
          let maxPoints = 0;
          let maxCar = null;
          let maxIndex = null;
          cars.forEach((car, carIndex) => {
            const location = getLocationAtRideFinish(time, car);
            const points = calculatePoints(location.time, location.position, ride, context);
            if (points > maxPoints) {
              maxPoints = points;
              maxCar = car;
              maxIndex = carIndex;
            }
          });

          if (maxCar) {
            debug(time, 'Best car:', maxPoints);
            savedRidesCount++;
            for (let i = 0; i < maxCar.nextRides.length; i++) {
              // reset the car assignment
              maxCar.nextRides[i].car = null;
            }
            ride.car = maxIndex;
            maxCar.nextRides.length = 0;
            maxCar.nextRides.push(ride);
            maxCar.nextFinish = advanceRide(getLocationAtRideFinish(time, maxCar), ride);
          } else {
            debug(time, 'No best');
            notSavedRidesCount++;
          }
        });
      }
    // }

    cars.forEach((car, carIndex) => {
      const { position, rides, nextRides, nextFinish } = car;
      let { mode, curRide } = car;

      if (!curRide) {
        let nextRide;
        if (nextRides.length > 0) {
          if (nextRides.length > maxNextRides) maxNextRides = nextRides.length;
          nextRide = nextRides.shift();
        } else {
          // the lookahead might be too short to have the list populated so try and get one now
          nextRide = pickNextRide(time, position, context);
          if (nextRide) {
            // mark the ride as taken and advance finishing time
            nextRide.car = carIndex;
            ridesToRemove.push(nextRide.index);
            car.nextFinish = advanceRide(nextFinish, nextRide);
          }
        }
        if (nextRide) {
          debug(time, carIndex, 'Ride:', nextRide.index);
          curRide = nextRide;
          mode = modes.MOVE_TO_START;
          car.rides.push(nextRide.index);
          const points = calculatePoints(time, position, nextRide, context);
          debug(time, carIndex, 'Points:', nextRide.index, points);
          totalPoints += points;
          if (points === 0) {
            missedRidesCount++;
            missedRidesPoints += distance(nextRide.start, nextRide.end) + bonus;
          }
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
    if (!ride.car) missedRidesCount++;
    return points + bonus + distance(ride.start, ride.end);
  }, 0);

  info('Max rides ahead:', maxNextRides);
  info('Saved rides:', savedRidesCount);
  info('Not saved rides:', notSavedRidesCount);
  info('Missed rides:', missedRidesCount, 'Points:', missedRidesPoints);

  return {
    cars,
    totalPoints,
    maxPoints,
  };
}
