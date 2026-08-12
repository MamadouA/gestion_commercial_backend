import { Feature, SubscriptionType } from "../../generated/prisma/enums";

export class CreateSubscriptionDTO {
    type!: SubscriptionType
    maxUserCount!: number
    storage!: number
    price!: number
    features!: Feature[]
}