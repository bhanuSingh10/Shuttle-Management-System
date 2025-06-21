export class Wallet {
  private balance: number

  constructor(initialBalance: number = 0) {
    this.balance = initialBalance
  }

  getBalance(): number {
    return this.balance
  }

  credit(amount: number) {
    if (amount <= 0) throw new Error("Amount must be positive")
    this.balance += amount
  }

  debit(amount: number) {
    if (amount <= 0) throw new Error("Amount must be positive")
    if (amount > this.balance) throw new Error("Insufficient balance")
    this.balance -= amount
  }
}