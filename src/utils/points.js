import { distance } from './vector';
import { error, info } from './log';


const modes = {
  EMPTY: 'EMPTY',
  MOVE_TO_START: 'MOVE_TO_START',
  MOVE_TO_END: 'MOVE_TO_END',
  WAITING: 'WAITING',
};

export function calculatePoints(time, position, ride, context) {
  const { bonus } = context;
  const { earliestStart, latestEnd } = ride;

  const distanceToRide = distance(position, ride.start);
  const waitingTime = earliestStart - distanceToRide - time;
  const adjustedWaitingTime = Math.max(0, waitingTime);
  const lengthOfRide = distance(ride.start, ride.end);

  const totalTime = distanceToRide + adjustedWaitingTime + lengthOfRide;

  let points = 0;
  if (time + totalTime < latestEnd) {
    points += lengthOfRide;
  }
  if (waitingTime >= 0) {
    points += bonus;
  }

  return points;
}

export function calculatePointsForAll(time, position, rides, context) {
  const finalLocation = rides.reduce((location, ride) => {
    const { points: currentPoints } = location;

    const points = calculatePoints(location.time, location.position, ride, context);
    const nextLocation = advanceRide(location, ride);
    nextLocation.points = currentPoints + points;
    return nextLocation;
  }, {
    time,
    position,
    points: 0,
  });
  return finalLocation.points;
}

/**
 * Add the duration of ride to the total and return it
 * @param location {{ time, position }}
 * @param ride
 */
export function advanceRide(location, ride) {
  const { time, position } = location;
  const distanceToRide = distance(position, ride.start);
  const waitingTime = ride.earliestStart - distanceToRide - time;
  const adjustedWaitingTime = Math.max(0, waitingTime);
  const lengthOfRide = distance(ride.start, ride.end);

  const nextTime = time + distanceToRide + adjustedWaitingTime + lengthOfRide;
  return {
    time: nextTime,
    position: ride.end,
  }
}

export function removeRide(allRides, rides) {
  if (!rides || !rides.length) return allRides;

  rides.sort((a, b) => b - a);
  rides.forEach(index => allRides.splice(index, 1));

  const startIndex = rides[rides.length - 1];
  for (let index = startIndex; index < allRides.length; index++) {
    allRides[index].index = index;
  }
  return allRides;
}

/**
 * Get the time when the car has finished its current ride
 * @param time
 * @param car
 */
export function getLocationAtRideFinish(time, car) {
  const { mode, curRide, position } = car;

  if (!car.curRide) {
    return {
      time,
      position,
    };
  }


  switch (mode) {
    case modes.MOVE_TO_START:
      return advanceRide({
        time,
        position,
      }, curRide);
    case modes.WAITING:
      return {
        time: time + Math.max(0, curRide.earliestStart - time) + distance(curRide.start, curRide.end),
        position: curRide.end,
      };
    case modes.MOVE_TO_END:
      return {
        time: time + distance(curRide.start, curRide.end),
        position: curRide.end,
      };
    default:
      error('Unexpected mode', mode);
      return {
        time,
        position: car.position,
      };
  }
}
