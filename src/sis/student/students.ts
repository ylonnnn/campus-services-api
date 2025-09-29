import prisma from "../../services/prisma";

class StudentManager {
    public async generateStudentNo() {
        return `${new Date().getFullYear()}-${(await prisma.studentUser.count()).toString().padStart(5, "0")}-${process.env.BRANCH_CODE!}-X`;
    }

    public isStudentNo(credential: string) {
        const parts = credential.split("-");
        if (parts.length != 4) return false;

        const [year = "", n = "", branchCode = "", x = ""] = parts;
        return (
            year.length >= 4 &&
            n.length == 5 &&
            branchCode.length == 2 &&
            x.length == 1
        );
    }
}

export const students = new StudentManager();
