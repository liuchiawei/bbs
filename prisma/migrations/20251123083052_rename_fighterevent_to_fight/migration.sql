/*
  Warnings:

  - You are about to drop the column `fighterEventId` on the `BettingLog` table. All the data in the column will be lost.
  - You are about to drop the `FighterEvent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fightId` to the `BettingLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BettingLog" DROP CONSTRAINT "BettingLog_fighterEventId_fkey";

-- DropForeignKey
ALTER TABLE "FighterEvent" DROP CONSTRAINT "FighterEvent_event_id_fkey";

-- DropForeignKey
ALTER TABLE "FighterEvent" DROP CONSTRAINT "FighterEvent_fighter_id_fkey";

-- DropForeignKey
ALTER TABLE "FighterEvent" DROP CONSTRAINT "FighterEvent_opponent_id_fkey";

-- DropIndex
DROP INDEX "BettingLog_fighterEventId_idx";

-- AlterTable
ALTER TABLE "BettingLog" DROP COLUMN "fighterEventId",
ADD COLUMN     "fightId" TEXT NOT NULL;

-- DropTable
DROP TABLE "FighterEvent";

-- CreateTable
CREATE TABLE "Fight" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "fighter_id" TEXT NOT NULL,
    "opponent_id" TEXT,
    "fight_type" "FightType" NOT NULL DEFAULT 'MAIN',
    "fight_order" INTEGER NOT NULL,
    "weight_class" TEXT,
    "result" TEXT,
    "method" TEXT,
    "round" INTEGER,
    "time" TEXT,
    "is_bettable" BOOLEAN NOT NULL DEFAULT true,
    "status" "FightStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fight_event_id_idx" ON "Fight"("event_id");

-- CreateIndex
CREATE INDEX "Fight_fighter_id_idx" ON "Fight"("fighter_id");

-- CreateIndex
CREATE INDEX "Fight_opponent_id_idx" ON "Fight"("opponent_id");

-- CreateIndex
CREATE INDEX "Fight_fight_type_fight_order_idx" ON "Fight"("fight_type", "fight_order");

-- CreateIndex
CREATE INDEX "Fight_is_bettable_status_idx" ON "Fight"("is_bettable", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Fight_event_id_fight_order_key" ON "Fight"("event_id", "fight_order");

-- CreateIndex
CREATE INDEX "BettingLog_fightId_idx" ON "BettingLog"("fightId");

-- AddForeignKey
ALTER TABLE "BettingLog" ADD CONSTRAINT "BettingLog_fightId_fkey" FOREIGN KEY ("fightId") REFERENCES "Fight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_fighter_id_fkey" FOREIGN KEY ("fighter_id") REFERENCES "Fighter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "Fighter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
