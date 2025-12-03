// db.ts
import { openDB } from "idb";

// Tipos para las reservas
export interface Reservation {
  _id?: string;
  clienteId: string;
  terrazaId: string;
  terrazaNombre: string;
  fechaReserva: Date | string;
  horaInicio: string;
  horaFin: string;
  tipoEvento?: string;
  descripcion?: string;
  numPersonas?: number;
  esVisita: boolean;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  pending?: boolean; // Para operaciones offline
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Tipos para operaciones en outbox
export type OutboxOp =
  | { id: string; op: "create"; clienteId: string; data: Reservation; ts: number }
  | { id: string; op: "update"; serverId?: string; clienteId?: string; data: Partial<Reservation>; ts: number }
  | { id: string; op: "delete"; serverId?: string; clienteId?: string; ts: number };

// Esquema de la base de datos
type DBSchema = {
  reservations: { key: string; value: Reservation };
  outbox: { key: string; value: OutboxOp };
  meta: { key: string; value: any };
};

let dbp: ReturnType<typeof openDB<DBSchema>>;

export function db() {
  if (!dbp) {
    dbp = openDB<DBSchema>("terraza-app-db", 1, {
      upgrade(d) {
        d.createObjectStore("reservations", { keyPath: "_id" });
        d.createObjectStore("outbox", { keyPath: "id" });
        d.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return dbp;
}

// Función para generar ID local
export function generateLocalId(): string {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Operaciones para reservas
export async function cacheReservations(list: Reservation[]) {
  const tx = (await db()).transaction("reservations", "readwrite");
  const s = tx.objectStore("reservations");
  await s.clear();
  for (const r of list) await s.put(r);
  await tx.done;
}

export async function putReservationLocal(reservation: Reservation) { 
  await (await db()).put("reservations", reservation); 
}

export async function getAllReservationsLocal() { 
  return (await (await db()).getAll("reservations")) || []; 
}

export async function getReservationLocal(id: string) { 
  return await (await db()).get("reservations", id); 
}

export async function removeReservationLocal(id: string) { 
  await (await db()).delete("reservations", id); 
}

/** Promociona una reserva local (clienteId) a serverId y quita pending */
export async function promoteLocalToServer(clienteId: string, serverId: string) {
  const d = await db();
  const r = await d.get("reservations", clienteId);
  if (r) {
    await d.delete("reservations", clienteId);
    r._id = serverId;
    r.pending = false;
    await d.put("reservations", r);
  }
}

// OUTBOX - Cola de operaciones pendientes
export async function queue(op: OutboxOp) { 
  await (await db()).put("outbox", op); 
}

export async function getOutbox() { 
  return (await (await db()).getAll("outbox")) || []; 
}

export async function clearOutbox() { 
  const tx = (await db()).transaction("outbox", "readwrite"); 
  await tx.store.clear(); 
  await tx.done; 
}

// Mapeo clienteId->serverId
export async function setMapping(clienteId: string, serverId: string) { 
  await (await db()).put("meta", { key: clienteId, serverId }); 
}

export async function getMapping(clienteId: string) { 
  return (await (await db()).get("meta", clienteId))?.serverId as string | undefined; 
}

// Obtener reservas pendientes (offline)
export async function getPendingReservations() {
  const all = await getAllReservationsLocal();
  return all.filter(r => r.pending === true);
}