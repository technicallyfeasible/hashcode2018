import { distance } from '../utils/vector';


/**
 * Uses the total time of the ride to score
 * @param time
 * @param position
 * @param ride
 * @param context
 * @return {number}
 */
export function scoreRideTotalTime(time, position, ride, context) {
  const { bonus } = context;
  const { earliestStart, latestEnd } = ride;

  const distanceToRide = distance(position, ride.start);
  const waitingTime = earliestStart - distanceToRide - time;
  const adjustedWaitingTime = Math.max(0, waitingTime);
  const lengthOfRide = distance(ride.start, ride.end);

  const wastedTime = distanceToRide + adjustedWaitingTime;
  const totalTime = wastedTime + lengthOfRide;

  let points = 0;
  if (time + totalTime < latestEnd) {
    points += lengthOfRide;
  }
  if (waitingTime >= 0) {
    points += bonus;
  }

  return points / (wastedTime * wastedTime + 1);
}


/**
 * Uses wasted time squared to score a ride to put a higher value on efficient rides
 * @param time
 * @param position
 * @param ride
 * @param context
 * @return {number}
 */
export function scoreRideWastedTime(time, position, ride, context) {
  const { bonus } = context;
  const { earliestStart, latestEnd } = ride;

  const distanceToRide = distance(position, ride.start);
  const waitingTime = earliestStart - distanceToRide - time;
  const adjustedWaitingTime = Math.max(0, waitingTime);
  const lengthOfRide = distance(ride.start, ride.end);

  const wastedTime = distanceToRide + adjustedWaitingTime;
  const totalTime = wastedTime + lengthOfRide;

  let points = 0;
  if (time + totalTime < latestEnd) {
    points += lengthOfRide;
  }
  if (waitingTime >= 0) {
    points += bonus;
  }

  return points / (wastedTime * wastedTime + 1);
}
