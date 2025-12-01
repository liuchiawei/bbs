-- CreateEnum
CREATE TYPE "FighterGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "Fighter" ADD COLUMN     "gender" "FighterGender" NOT NULL DEFAULT 'MALE',
ADD COLUMN     "titles" TEXT[] DEFAULT ARRAY[]::TEXT[];
