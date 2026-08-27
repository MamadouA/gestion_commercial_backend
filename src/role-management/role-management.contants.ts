import { PermissionType } from "./role.types"

// -
export const USER_PERMISSIONS: PermissionType[] = [
    {
        name: "user.access",
        description: "Consulter la liste des utilisateurs",
        feature: "USER"
    },
    {
        name: "client.manage",
        description: "Gérer les clients",
        feature: "CLIENT"
    },
    {
        name: "prospection.manage",
        description: "Gérer les prospection",
        feature: "PROSPECTION"
    },
    {
        name: "offer.manage",
        description: "Gérer les offres",
        feature: "OFFER"
    },
    {
        name: "project.manage",
        description: "Gérer les projets",
        feature: "PROJECT"
    }
]


// -
export const ADMIN_PERMISSIONS: PermissionType[] = [
    {
        name: "user.manage",
        description: "Gérer les utilisateurs",
        feature: "USER"
    },
    ...USER_PERMISSIONS
]