/*
  Warnings:

  - A unique constraint covering the columns `[event_id,fight_order,fighter_id]` on the table `Fight` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Fight_event_id_fight_order_key";

-- CreateIndex
CREATE UNIQUE INDEX "Fight_event_id_fight_order_fighter_id_key" ON "Fight"("event_id", "fight_order", "fighter_id");
