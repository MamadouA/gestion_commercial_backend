import { Feature } from "../generated/prisma/enums"

export interface CurrentUserType {
    id: number
    fullname: string
    email: string
    tenantId: number
    role: {
        name: string
        description: string
        permissions: {
            name: string
            description: string
            feature: string
        }[]
    },
    tenant: {
        id: number
        name: string
        subscription: {
            id: number
            name: string
            maxUserCount: number
            storage: number
            price: number
            features: Feature[]
        }
    }
}