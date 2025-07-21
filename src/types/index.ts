export interface DrinkData {
  id: string
  name: string
  emoji: string
  volume: number // en ml
  alcoholPercentage: number // en %
  quantity: number
  lastSipTime: Date
}

export interface FormData {
  drinks: DrinkData[]
  weight: number
}

export interface TimerData {
  hoursRemaining: number
  minutesRemaining: number
  lastSipTime: Date
  targetTime: Date
}

export interface DrinkTemplate {
  id: string
  name: string
  emoji: string
  volume: number
  alcoholPercentage: number
}