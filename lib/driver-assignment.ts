export class DriverAssignment {
  driverId: string
  vehicleId: string
  routeId: string

  constructor(driverId: string, vehicleId: string, routeId: string) {
    this.driverId = driverId
    this.vehicleId = vehicleId
    this.routeId = routeId
  }

  reassignVehicle(newVehicleId: string) {
    this.vehicleId = newVehicleId
  }

  reassignRoute(newRouteId: string) {
    this.routeId = newRouteId
  }
}
