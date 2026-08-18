import { Feature } from "../generated/prisma/enums"

export interface SubscriptionType {
    id: number
    name: string
    maxUserCount: number
    storage: number
    price: number
    features: Feature[]
}