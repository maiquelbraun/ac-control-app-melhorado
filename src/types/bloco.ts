import { Bloco } from '@prisma/client';

export type BlocoComSalas = Bloco & {
  salas: { id: string; nome: string }[];
};
