
// -
export const PERMISSIONS_ON_DASHBOARD = [
    
]

// -
export const PERMISSIONS_ON_ROLE = [
    
]

// -
export const PERMISSIONS_ON_USER = [
    {
        name: "user.list",
        description: "Voir la liste des utilisateurs",
        feature: "USER"
    },
    {
        name: "user.create",
        description: "Créer un utilisateur",
        feature: "USER"
    },
    {
        name: "user.update",
        description: "Modifier un utilisateur",
        feature: "USER"
    },
    {
        name: "user.delete",
        description: "Supprimer un utilisateur",
        feature: "USER"
    }
]

// -
export const PERMISSIONS_ON_PROSPECTION = [
    
]

// -
export const PERMISSIONS_ON_CLIENT = [
    
]

// -
export const PERMISSIONS_ON_PROJECT = [
    
]

// -
export const PERMISSIONS_ON_OFFER = [
    
]

// -
export const PERMISSIONS_ON_TIMESHEET = [
    
]

export const APP_PERMISSIONS = {
    DASHBOARD: PERMISSIONS_ON_DASHBOARD,
    ROLE: PERMISSIONS_ON_ROLE,
    USER: PERMISSIONS_ON_USER,
    PROSPECTION: PERMISSIONS_ON_PROSPECTION,
    CLIENT: PERMISSIONS_ON_CLIENT,
    PROJECT: PERMISSIONS_ON_PROJECT,
    OFFER: PERMISSIONS_ON_OFFER,
    TIMESHEET: PERMISSIONS_ON_TIMESHEET
}