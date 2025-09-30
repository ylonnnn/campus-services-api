/*
  Warnings:

  - You are about to drop the column `section` on the `StudentUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."StudentUser" DROP COLUMN "section",
ADD COLUMN     "sectionId" INTEGER,
ALTER COLUMN "year" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."Section" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_id_key" ON "public"."Section"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Section_code_key" ON "public"."Section"("code");

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentUser" ADD CONSTRAINT "StudentUser_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
