import { PermissionType } from "./role.types"

// -
export const APP_PERMISSIONS: PermissionType[] = [
    {
        name: "user.access",
        description: "Consulter la liste des utilisateurs",
        feature: "USER"
    },
    {
        name: "lead.manage",
        description: "Gérer les leads",
        feature: "LEAD"
    },
    {
        name: "project.manage",
        description: "Gérer les projets",
        feature: "PROJECT"
    },
    {
        name: "user.manage",
        description: "Gérer les utilisateurs",
        feature: "USER"
    }
]
