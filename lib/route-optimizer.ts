import { calculateDistance } from "./utils";

export type Stop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  routeId: string;
  route?: any;
};

export class RouteOptimizer {
  stops: Stop[];

  constructor(stops: Stop[]) {
    this.stops = stops;
  }

  // Find direct route between two stops
  findDirectRoute(fromStop: Stop, toStop: Stop) {
    if (fromStop.routeId === toStop.routeId) {
      return {
        type: "direct",
        route: fromStop.route,
        distance: calculateDistance(
          fromStop.latitude,
          fromStop.longitude,
          toStop.latitude,
          toStop.longitude
        ),
        estimatedTime: 15 // Mock estimation
      };
    }
    return null;
  }

  // Find transfer options between two stops
  findTransferOptions(fromStop: Stop, toStop: Stop) {
    const transferOptions = this.stops
      .filter(
        (stop) =>
          stop.routeId !== fromStop.routeId && stop.routeId !== toStop.routeId
      )
      .map((transferStop) => {
        const distanceFromStart = calculateDistance(
          fromStop.latitude,
          fromStop.longitude,
          transferStop.latitude,
          transferStop.longitude
        );
        const distanceToEnd = calculateDistance(
          transferStop.latitude,
          transferStop.longitude,
          toStop.latitude,
          toStop.longitude
        );
        return {
          transferStop,
          totalDistance: distanceFromStart + distanceToEnd
        };
      })
      .sort((a, b) => a.totalDistance - b.totalDistance)
      .slice(0, 3);

    return {
      type: "transfer",
      options: transferOptions.map((option) => ({
        transferStop: option.transferStop,
        totalDistance: option.totalDistance,
        estimatedTime: Math.ceil(option.totalDistance * 3) // Mock estimation
      }))
    };
  }
}
