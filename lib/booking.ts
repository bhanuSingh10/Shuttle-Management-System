type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED"

export class Booking {
  id: string
  userId: string
  fromStopId: string
  toStopId: string
  status: BookingStatus

  constructor(id: string, userId: string, fromStopId: string, toStopId: string) {
    this.id = id
    this.userId = userId
    this.fromStopId = fromStopId
    this.toStopId = toStopId
    this.status = "PENDING"
  }

  confirm() {
    this.status = "CONFIRMED"
  }

  cancel() {
    this.status = "CANCELLED"
  }
}