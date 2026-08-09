import { PermissionDTO } from "./role.types"

// -
export const PERMISSIONS_ON_DASHBOARD: PermissionDTO[] = [
    {
        name: "dashboard.view_monthly_revenue",
        description: "Voir le chiffre d'affaire mensuelle",
        feature: "DASHBOARD"
    },
    {
        name: "dashboard.view_offer_overview",
        description: "Voir les statistiques sur les offres",
        feature: "DASHBOARD"
    },
    {
        name: "dashboard.view_project_overview",
        description: "Voir les statistiques sur les projets",
        feature: "DASHBOARD"
    },
    {
        name: "dashboard.view_prospection_overview",
        description: "Voir les statistiques sur les prospects",
        feature: "DASHBOARD"
    },
    {
        name: "dashboard.view_invoice_overview",
        description: "Voir les statistiques sur les factures",
        feature: "DASHBOARD"
    },
    {
        name: "dashboard.view_user_overview",
        description: "Voir les statistiques sur les utilisateurs",
        feature: "DASHBOARD"
    },
    {
        name: "dashboard.view_timesheet_overview",
        description: "Voir les statistiques sur les feuilles de temps",
        feature: "DASHBOARD"
    },
    {
        name: "dashboard.view_tenant_overview",
        description: "Voir les statistiques sur les tenants",
        feature: "DASHBOARD"
    }
]

// -
export const PERMISSIONS_ON_ROLE: PermissionDTO[] = [
    {
        name: "role.list",
        description: "Voir la liste des roles",
        feature: "ROLE"
    },
    {
        name: "role.create",
        description: "Créer un role",
        feature: "ROLE"
    },
    {
        name: "role.update",
        description: "Modifier un role",
        feature: "ROLE"
    },
    {
        name: "role.delete",
        description: "Supprimer un role",
        feature: "ROLE"
    }
]

// -
export const PERMISSIONS_ON_USER: PermissionDTO[] = [
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
    },
]

// -
export const PERMISSIONS_ON_PROSPECTION: PermissionDTO[] = [
    {
        name: "prospection.list",
        description: "Voir la liste des prospects",
        feature: "PROSPECTION"
    },
    {
        name: "prospection.create",
        description: "Créer un prospect",
        feature: "PROSPECTION"
    },
    {
        name: "prospection.update",
        description: "Modifier un prospect",
        feature: "PROSPECTION"
    },
    {
        name: "prospection.delete",
        description: "Supprimer un prospect",
        feature: "PROSPECTION"
    }
]

// -
export const PERMISSIONS_ON_CLIENT: PermissionDTO[] = [
    {
        name: "client.list",
        description: "Voir la liste des clients",
        feature: "CLIENT"
    },
    {
        name: "client.create",
        description: "Créer un client",
        feature: "CLIENT"
    },
    {
        name: "client.update",
        description: "Modifier un client",
        feature: "CLIENT"
    },
    {
        name: "client.delete",
        description: "Supprimer un client",
        feature: "CLIENT"
    }
]

// -
export const PERMISSIONS_ON_PROJECT: PermissionDTO[] = [
    {
        name: "project.list",
        description: "Voir la liste des projets",
        feature: "PROJECT"
    },
    {
        name: "project.create",
        description: "Créer un projet",
        feature: "PROJECT"
    },
    {
        name: "project.update",
        description: "Modifier un projet",
        feature: "PROJECT"
    },
    {
        name: "project.delete",
        description: "Supprimer un projet",
        feature: "PROJECT"
    }
]

// -
export const PERMISSIONS_ON_OFFER: PermissionDTO[] = [
    {
        name: "offer.list",
        description: "Voir la liste des offres",
        feature: "OFFER"
    },
    {
        name: "offer.create",
        description: "Créer une offre",
        feature: "OFFER"
    },
    {
        name: "offer.update",
        description: "Modifier une offre",
        feature: "OFFER"
    },
    {
        name: "offer.delete",
        description: "Supprimer une offre",
        feature: "OFFER"
    }
]

// -
export const PERMISSIONS_ON_TIMESHEET: PermissionDTO[] = [
    {
        name: "timesheet.list",
        description: "Voir la liste des feuilles de temps",
        feature: "TIMESHEET"
    },
    {
        name: "timesheet.create",
        description: "Créer une feuille de temps",
        feature: "TIMESHEET"
    },
    {
        name: "timesheet.update",
        description: "Modifier une feuille de temps",
        feature: "TIMESHEET"
    },
    {
        name: "timesheet.delete",
        description: "Supprimer une feuille de temps",
        feature: "TIMESHEET"
    }
]

export const PERMISSIONS_ON_ALERTE: PermissionDTO[] = [
    {
        name: "alerte.list",
        description: "Voir la liste des alertes",
        feature: "ALERTE"
    },
    {
        name: "alerte.update",
        description: "Modifier une alerte",
        feature: "ALERTE"
    },
    {
        name: "alerte.delete",
        description: "Supprimer une alerte",
        feature: "ALERTE"
    }
]

// -
export const PERMISSIONS_ON_INVOICE: PermissionDTO[] = [
    {
        name: "invoice.list",
        description: "Voir la liste des factures",
        feature: "INVOICE"
    },
    {
        name: "invoice.create",
        description: "Créer une facture",
        feature: "INVOICE"
    },
    {
        name: "invoice.update",
        description: "Modifier une facture",
        feature: "INVOICE"
    },
    {
        name: "invoice.delete",
        description: "Supprimer une facture",
        feature: "INVOICE"
    }
]

// -
export const PERMISSIONS_ON_TENANT: PermissionDTO[] = [
    {
        name: "tenant.manage",
        description: "Voir et gérer l'ensemble des des tenants",
        feature: "TENANT"
    },
]

export const APP_PERMISSIONS = {
    DASHBOARD: PERMISSIONS_ON_DASHBOARD,
    ROLE: PERMISSIONS_ON_ROLE,
    USER: PERMISSIONS_ON_USER,
    PROSPECTION: PERMISSIONS_ON_PROSPECTION,
    CLIENT: PERMISSIONS_ON_CLIENT,
    PROJECT: PERMISSIONS_ON_PROJECT,
    OFFER: PERMISSIONS_ON_OFFER,
    INVOICE: PERMISSIONS_ON_INVOICE,
    TENANT: PERMISSIONS_ON_TENANT,
    TIMESHEET: PERMISSIONS_ON_TIMESHEET,
    ALERTE: PERMISSIONS_ON_ALERTE
}