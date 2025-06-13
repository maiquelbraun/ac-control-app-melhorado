-- CreateTable
CREATE TABLE "Bloco" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "blocoId" TEXT NOT NULL,
    CONSTRAINT "Sala_blocoId_fkey" FOREIGN KEY ("blocoId") REFERENCES "Bloco" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Climatizador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "salaId" TEXT NOT NULL,
    "dispositivoControleId" TEXT NOT NULL,
    "ligado" BOOLEAN NOT NULL DEFAULT false,
    "temperaturaDesejada" REAL,
    "modoOperacao" TEXT,
    "velocidadeVentilador" TEXT,
    "statusOperacional" TEXT NOT NULL DEFAULT 'OK',
    "ultimaManutencao" DATETIME,
    "proximaManutencaoRecomendada" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Climatizador_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Climatizador_dispositivoControleId_fkey" FOREIGN KEY ("dispositivoControleId") REFERENCES "DispositivoControle" ("idEsp32") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DispositivoControle" (
    "idEsp32" TEXT NOT NULL PRIMARY KEY,
    "modeloEsp32" TEXT,
    "firmwareVersion" TEXT,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "ultimoContato" DATETIME,
    "emissorIrOk" BOOLEAN NOT NULL DEFAULT true,
    "sensorCorrenteOk" BOOLEAN NOT NULL DEFAULT true,
    "sensorTensaoOk" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "LeituraSensor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "climatizadorId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "corrente" REAL,
    "tensao" REAL,
    "potenciaAparente" REAL,
    "temperaturaAmbiente" REAL,
    "umidadeAmbiente" REAL,
    CONSTRAINT "LeituraSensor_climatizadorId_fkey" FOREIGN KEY ("climatizadorId") REFERENCES "Climatizador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Bloco_nome_key" ON "Bloco"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_blocoId_nome_key" ON "Sala"("blocoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Climatizador_dispositivoControleId_key" ON "Climatizador"("dispositivoControleId");

-- CreateIndex
CREATE UNIQUE INDEX "DispositivoControle_idEsp32_key" ON "DispositivoControle"("idEsp32");
