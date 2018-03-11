import { scoreRideEqualPoints } from './scoring';
import { distance } from '../utils/vector';


export function pickNextRide(time, position, context, exclude) {
  const { rideData } = context;

  const scoreRide = scoreRideEqualPoints;

  // take the best X rides and evaluate them a step further
  const SAMPLE_RIDES = 3;

  const nextRides = rideData.reduce((bestRides, ride) => {
    if (ride.car >= 0 || exclude === ride) return bestRides;

    // this ride is free
    const score = scoreRide(time, position, ride, context);

    if (bestRides.length < SAMPLE_RIDES) {
      bestRides.push({
        score,
        ride,
      });
      return bestRides;
    }
    // loop over all best rides and find the highest we can beat
    const bestRide = bestRides.reduce((currentBestRide, bestRideCandidate) => {
      const { score: lastScore } = bestRideCandidate;
      if (score > lastScore) {
        return bestRideCandidate;
      }
      return currentBestRide;
    }, null);

    if (bestRide) {
      bestRide.score = score;
      bestRide.ride = ride;
    }

    return bestRides;
  }, []);

  if (!nextRides.length) {
    return null;
  }

  if (exclude || nextRides.length === 1) {
    const { ride } = nextRides[0];
    return ride;
  }

  const nextRide = nextRides.reduce((bestRide, scoredRide) => {
    const { ride } = scoredRide;
    if (!ride) return bestRide;

    const { score: lastScore } = bestRide;

    let score = lastScore;

    const distanceToRide = distance(position, ride.start);
    const waitingTime = ride.earliestStart - distanceToRide - time;
    const adjustedWaitingTime = Math.max(0, waitingTime);
    const lengthOfRide = distance(ride.start, ride.end);
    const nextTime = time + distanceToRide + adjustedWaitingTime + lengthOfRide;

    const lookaheadRide = pickNextRide(nextTime, ride.end, context, ride);
    if (lookaheadRide) {
      score += scoreRide(nextTime, ride.end, lookaheadRide, context);
    }
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
  return ride;
}
