-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_address_key" ON "tokens"("address");
