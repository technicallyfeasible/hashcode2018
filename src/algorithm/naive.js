import { debug } from '../utils/log';
import { distance } from '../utils/vector';


function scoreRide(time, position, ride, context) {
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

  return points / totalTime;
}

export function pickNextRide(car, time, position, context) {
  const { rideData } = context;

  const nextRide = rideData.reduce((bestRide, ride) => {
    if (ride.car >= 0) return bestRide;

    const { score: lastScore } = bestRide;

    // this ride is free
    const score = scoreRide(time, position, ride, context);
    // the score did not improve so just leave it
    if (bestRide.ride && score <= lastScore) return bestRide;

    return {
      score,
      ride,
    };
  }, {
    score: 0,
    ride: null,
  });

  const { ride } = nextRide;
  if (ride !== null) {
    ride.car = car;
    return ride;
  }
  return null;
}
