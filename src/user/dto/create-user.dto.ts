import { Tenant } from "../../generated/prisma/client";

export class CreateUserDto {
    fullname: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    tenant: Tenant;
    
    constructor(fullname: string, email: string, phone: string, password: string, confirmPassword: string, tenant: Tenant) {
        this.fullname = fullname;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.tenant = tenant;
    }
}
