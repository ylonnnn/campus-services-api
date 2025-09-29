import { UserRole } from "../generated/prisma";

export const roleSet = new Set<UserRole>()
    .add(UserRole.Visitor)
    .add(UserRole.Student)
    .add(UserRole.Faculty)
    .add(UserRole.Administrator);

export const userAuthority = new Map<UserRole, Set<UserRole>>()
    //
    .set(UserRole.Faculty, new Set<UserRole>().add(UserRole.Student))
    .set(
        UserRole.Administrator,
        new Set<UserRole>().add(UserRole.Student).add(UserRole.Faculty)
    );
