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

  return points / totalTime;
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

/**
 * Assigns equal points to rides regardless of length to remove bias when there are a few very long rides
 * @param time
 * @param position
 * @param ride
 * @param context
 * @return {number}
 */
export function scoreRideEqualPoints(time, position, ride, context) {
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
    points += 400;
  }
  if (waitingTime >= 0) {
    points += bonus;
  }

  return points / (wastedTime * wastedTime + 1);
}

/**
 * Assigns extra points to rides that would be missed in a configurable time interval if not taken
 * @param time
 * @param position
 * @param ride
 * @param context
 * @return {number}
 */
export function scoreRideAnxiety(time, position, ride, context) {
  const { bonus, steps } = context;
  const { earliestStart, latestEnd } = ride;

  const ANXIETY_STEPS = 1000; // steps / 1000;

  const distanceToRide = distance(position, ride.start);
  const waitingTime = earliestStart - distanceToRide - time;
  const adjustedWaitingTime = Math.max(0, waitingTime);
  const lengthOfRide = distance(ride.start, ride.end);

  const wastedTime = distanceToRide + adjustedWaitingTime;
  const totalTime = wastedTime + lengthOfRide;

  let points = 0;
  if (time + totalTime < latestEnd) {
    points += 400;
  }
  if (waitingTime >= 0) {
    points += bonus;
  }
  if (time + ANXIETY_STEPS > latestEnd) {
    points *= 2;
  }

  return points / (wastedTime * wastedTime + 1);
}
