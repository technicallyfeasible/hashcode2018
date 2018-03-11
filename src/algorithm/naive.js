import { scoreRideWastedTime } from './scoring';


export function pickNextRide(time, position, context) {
  const { rideData } = context;

  const nextRide = rideData.reduce((bestRide, ride) => {
    if (ride.car >= 0) return bestRide;

    const { score: lastScore } = bestRide;

    // this ride is free
    const score = scoreRideWastedTime(time, position, ride, context);
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
