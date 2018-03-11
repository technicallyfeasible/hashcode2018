import { scoreRideEqualPoints } from './scoring';
import { advanceRide } from '../utils/points';


/**
 * Pick the next best ride and then check if that would mean we miss another ride
 * Take the best ride we would have missed instead
 * @param time
 * @param position
 * @param context
 */
export function pickNextRide(time, position, context) {
  const { rideData } = context;

  const nextRide = rideData.reduce((bestRide, availableRide) => {
    if (availableRide.car >= 0) return bestRide;

    const { score: lastScore } = bestRide;

    // this ride is free
    const score = scoreRideEqualPoints(time, position, availableRide, context);
    // the score did not improve so just leave it
    if (bestRide.ride && score <= lastScore) return bestRide;

    return {
      score,
      ride: availableRide,
    };
  }, {
    score: 0,
    ride: null,
  });

  let { ride } = nextRide;

  if (ride) {
    const { time: nextTime } = advanceRide({ time, position }, ride);

    const nextExpiringRide = rideData.reduce((bestRide, availableRide) => {
      // don't care if the ride is taken or doesn't expire soon
      if (availableRide.car >= 0 || availableRide.latestEnd > nextTime) return bestRide;

      const { score: lastScore } = bestRide;

      // this ride is free
      const score = scoreRideEqualPoints(time, position, availableRide, context);
      // the score did not improve so just leave it
      if (bestRide.ride && score <= lastScore) return bestRide;

      return {
        score,
        ride: availableRide,
      };
    }, {
      score: 0,
      ride: null,
    });

    if (nextExpiringRide.ride) {
      ride = nextExpiringRide.ride;
    }
  }

  return ride;
}
