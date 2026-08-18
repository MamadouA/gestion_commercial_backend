import { SubscriptionType } from "../subscription/subscription.types"

export interface TenantType {
    id: string
    name: string
    subscription: SubscriptionType
}