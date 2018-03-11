import { distance } from './vector';


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
