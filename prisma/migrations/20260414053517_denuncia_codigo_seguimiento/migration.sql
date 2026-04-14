/*
  Warnings:

  - A unique constraint covering the columns `[codigo_seguimiento]` on the table `aer_denuncia` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "aer_denuncia" ADD COLUMN     "codigo_seguimiento" VARCHAR(20),
ALTER COLUMN "celular_contacto" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "aer_denuncia_codigo_seguimiento_key" ON "aer_denuncia"("codigo_seguimiento");
