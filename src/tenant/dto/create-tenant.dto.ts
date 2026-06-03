export class CreateTenantDto {
    name: string;
    isActive: boolean;
    createdAt: Date;

    constructor(name: string, isActive: boolean, createdAt: Date) {
        this.name = name;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }
}
