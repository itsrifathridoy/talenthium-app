-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activeTemplateId" INTEGER;

-- CreateTable
CREATE TABLE "portfolio_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_templates_name_key" ON "portfolio_templates"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_activeTemplateId_fkey" FOREIGN KEY ("activeTemplateId") REFERENCES "portfolio_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
