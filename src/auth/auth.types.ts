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
    }
}