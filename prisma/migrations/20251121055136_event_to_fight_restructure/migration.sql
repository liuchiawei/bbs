/*
  Warnings:

  - You are about to drop the column `is_manual_override` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `winner_id` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[event_id,fight_order]` on the table `FighterEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ip_address` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fighterEventId` to the `BettingLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fight_order` to the `FighterEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FightType" AS ENUM ('MAIN', 'CO_MAIN', 'PRELIMS', 'EARLY_PRELIMS');

-- CreateEnum
CREATE TYPE "FightStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "FighterEvent" DROP CONSTRAINT "FighterEvent_fighter_id_fkey";

-- DropIndex
DROP INDEX "FighterEvent_fighter_id_event_id_key";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ip_address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BettingLog" ADD COLUMN     "fighterEventId" TEXT NOT NULL,
ADD COLUMN     "is_winning_bet" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "is_manual_override",
DROP COLUMN "winner_id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "poster_url" TEXT,
ADD COLUMN     "promoter" TEXT,
ADD COLUMN     "venue" TEXT;

-- AlterTable
ALTER TABLE "FighterEvent" ADD COLUMN     "fight_order" INTEGER NOT NULL,
ADD COLUMN     "fight_type" "FightType" NOT NULL DEFAULT 'MAIN',
ADD COLUMN     "is_bettable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "FightStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "BettingLog_fighterEventId_idx" ON "BettingLog"("fighterEventId");

-- CreateIndex
CREATE INDEX "BettingLog_settlement_status_idx" ON "BettingLog"("settlement_status");

-- CreateIndex
CREATE INDEX "Event_promoter_idx" ON "Event"("promoter");

-- CreateIndex
CREATE INDEX "FighterEvent_fight_type_fight_order_idx" ON "FighterEvent"("fight_type", "fight_order");

-- CreateIndex
CREATE INDEX "FighterEvent_is_bettable_status_idx" ON "FighterEvent"("is_bettable", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FighterEvent_event_id_fight_order_key" ON "FighterEvent"("event_id", "fight_order");

-- AddForeignKey
ALTER TABLE "BettingLog" ADD CONSTRAINT "BettingLog_fighterEventId_fkey" FOREIGN KEY ("fighterEventId") REFERENCES "FighterEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FighterEvent" ADD CONSTRAINT "FighterEvent_fighter_id_fkey" FOREIGN KEY ("fighter_id") REFERENCES "Fighter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
