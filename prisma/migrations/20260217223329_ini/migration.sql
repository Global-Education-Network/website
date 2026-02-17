-- CreateTable
CREATE TABLE "Registration" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "contributions" TEXT[],
    "contributionOther" TEXT,
    "donationCommitment" TEXT,
    "contactPermission" BOOLEAN NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);
