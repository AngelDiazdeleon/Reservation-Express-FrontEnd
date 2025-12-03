import { reservationApi } from "../api";
import {
  getOutbox, clearOutbox, setMapping, getMapping,
  removeReservationLocal, promoteLocalToServer,
  getReservationLocal, getAllReservationsLocal,
  type Reservation, type OutboxOp
} from "./db";

// Exporta syncNow como función nombrada
export async function syncNow() {
  console.log('🔄 ===== INICIANDO SINCRONIZACIÓN =====');
  
  // Verificar conexión
  if (!navigator.onLine) {
    console.log('📴 Sin conexión, no se puede sincronizar');
    return { success: false, error: 'Sin conexión a internet' };
  }

  console.log('✅ Conexión a internet verificada');

  // Obtener operaciones pendientes
  const ops = await getOutbox();
  console.log(`📦 Operaciones pendientes en outbox: ${ops.length}`);
  
  if (ops.length === 0) {
    console.log('✅ No hay operaciones pendientes para sincronizar');
    return { success: true, syncedCount: 0 };
  }

  console.log('📋 Detalles de operaciones pendientes:');
  ops.forEach((op, index) => {
    console.log(`   ${index + 1}. ${op.op} - ${op.clienteId}`);
  });

  // Preparar datos para sincronizar
  const reservationsToSync: Array<any> = [];
  
  for (const op of ops) {
    if (op.op === "create") {
      console.log(`📤 Procesando creación de reserva: ${op.clienteId}`);
      
      const data = op.data as any;
      
      const reservation = {
        clienteId: op.clienteId,
        terrazaId: data.terrazaId || "terraza-default",
        terrazaNombre: data.terrazaNombre || "Terraza",
        fechaReserva: data.fechaReserva || new Date().toISOString(),
        horaInicio: data.horaInicio || "10:00",
        horaFin: data.horaFin || "12:00",
        tipoEvento: data.tipoEvento || "",
        descripcion: data.descripcion || "",
        numPersonas: data.numPersonas || 1,
        esVisita: data.esVisita || false,
        estado: data.estado || "pendiente",
        
        // Campos adicionales importantes
        precioTotal: data.precioTotal || 0,
        ubicacion: data.ubicacion || '',
        capacidad: data.capacidad || 0,
        propietarioNombre: data.propietarioNombre || '',
        duracionVisita: data.duracionVisita || (data.esVisita ? 1.5 : 5),
        nombreCliente: data.nombreCliente || '',
        emailCliente: data.emailCliente || '',
        phoneCliente: data.phoneCliente || '',
        
        // Timestamps
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      };
      
      console.log(`   📝 Datos preparados para sincronización:`, {
        clienteId: reservation.clienteId,
        terrazaNombre: reservation.terrazaNombre,
        fecha: reservation.fechaReserva,
        tipo: reservation.esVisita ? 'Visita' : 'Reserva'
      });
      
      reservationsToSync.push(reservation);
    } else {
      console.log(`⚠️ Operación ${op.op} para ${op.clienteId} no soportada en esta versión`);
    }
  }

  // Sincronizar con el servidor
  if (reservationsToSync.length > 0) {
    try {
      console.log(`🚀 Enviando ${reservationsToSync.length} reservas al servidor...`);
      
      const response = await reservationApi.bulkSync({
        reservations: reservationsToSync
      });

      console.log('📦 Respuesta del servidor recibida:', response.data);

      if (response.data && response.data.success) {
        console.log('✅ Sincronización exitosa en backend');
        console.log(`📊 Estadísticas del servidor:`);
        console.log(`   - Mapeos recibidos: ${response.data.mapping?.length || 0}`);
        console.log(`   - Sincronizadas: ${response.data.syncedCount || 0}`);
        console.log(`   - Guardadas en DB: ${response.data.savedCount || 0}`);
        
        if (response.data.mapping && response.data.mapping.length > 0) {
          console.log('🔗 Procesando mapeos recibidos...');
          
          // Actualizar IDs locales con IDs del servidor
          for (const mapping of response.data.mapping) {
            console.log(`   🔄 Promoviendo reserva: ${mapping.clienteId} -> ${mapping.serverId}`);
            
            try {
              // Verificar que la reserva existe antes de promover
              const reservation = await getReservationLocal(mapping.clienteId);
              if (reservation) {
                console.log(`       ✅ Reserva local encontrada: ${reservation.terrazaNombre}`);
                await promoteLocalToServer(mapping.clienteId, mapping.serverId);
                console.log(`       ✅ Reserva promovida exitosamente`);
                
                // Guardar el mapeo
                await setMapping(mapping.clienteId, mapping.serverId);
                console.log(`       ✅ Mapeo guardado en IndexedDB`);
              } else {
                console.warn(`       ⚠️ No se encontró la reserva local ${mapping.clienteId}`);
              }
            } catch (error) {
              console.error(`       ❌ Error promoviendo reserva ${mapping.clienteId}:`, error);
            }
          }
          
          // Limpiar la cola de operaciones
          await clearOutbox();
          console.log('🧹 Cola de operaciones limpiada');
          
          // Verificar estado después de sincronización
          const updatedReservations = await getAllReservationsLocal();
          const pendingAfterSync = await getOutbox();
          
          console.log(`📊 Estado después de sincronizar:`);
          console.log(`   - Reservas en local: ${updatedReservations.length}`);
          console.log(`   - Operaciones pendientes: ${pendingAfterSync.length}`);
          
          return { 
            success: true, 
            syncedCount: reservationsToSync.length,
            savedCount: response.data.savedCount || 0,
            message: `Sincronización completada: ${reservationsToSync.length} reservas procesadas`
          };
        } else {
          console.warn('⚠️ Sincronización exitosa pero sin mapeos recibidos');
          return { 
            success: true, 
            syncedCount: 0,
            message: 'Sincronización completada pero sin cambios'
          };
        }
      } else {
        console.error('❌ Respuesta del servidor indica error:', response.data);
        return { 
          success: false, 
          error: response.data?.message || 'Error en la sincronización'
        };
      }
    } catch (error: any) {
      console.error("❌ Error en sincronización:", error.message);
      console.error("📋 Detalles del error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      return { 
        success: false, 
        error: error.message || 'Error desconocido en sincronización'
      };
    }
  }
  
  console.log('ℹ️ No hay reservas para sincronizar');
  return { success: true, syncedCount: 0 };
}

// Exporta setupOnlineSync también si la necesitas
export function setupOnlineSync() {
  const handleOnline = () => {
    console.log('🌐 Conexión restaurada - Iniciando sincronización automática...');
    
    setTimeout(async () => {
      try {
        console.log('🔄 Sincronización automática iniciada...');
        const result = await syncNow();
        
        if (result.success) {
          console.log(`✅ Sincronización automática completada: ${result.syncedCount || 0} reservas sincronizadas`);
        } else {
          console.error('❌ Sincronización automática falló:', result.error);
        }
      } catch (error) {
        console.error('❌ Error en sincronización automática:', error);
      }
    }, 3000);
  };

  const handleLoad = () => {
    if (navigator.onLine) {
      console.log('📱 Página cargada con conexión - Verificando sincronización...');
      setTimeout(() => {
        syncNow().catch(console.error);
      }, 5000);
    }
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("load", handleLoad);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("load", handleLoad);
  };
}

// Exporta otras funciones si las necesitas
export async function loadReservations() {
  console.log('📋 Cargando reservas...');
  
  try {
    if (navigator.onLine) {
      console.log('🌐 Modo online - Intentando cargar del servidor...');
      
      try {
        const response = await reservationApi.getMyReservations();
        
        if (response.data && response.data.success) {
          console.log(`✅ ${response.data.data?.length || 0} reservas cargadas del servidor`);
          
          const { cacheReservations, getPendingReservations } = await import("./db");
          await cacheReservations(response.data.data || []);
          
          const pending = await getPendingReservations();
          console.log(`📱 ${pending.length} reservas pendientes locales`);
          
          const allReservations = [...(response.data.data || []), ...pending];
          console.log(`📊 Total de reservas: ${allReservations.length}`);
          
          return allReservations;
        }
      } catch (error: any) {
        console.error('❌ Error cargando reservas online:', error.message);
        console.log('📱 Continuando con carga local...');
      }
    } else {
      console.log('📴 Modo offline - Cargando solo locales');
    }
    
    const { getAllReservationsLocal } = await import("./db");
    const localReservations = await getAllReservationsLocal();
    console.log(`📱 ${localReservations.length} reservas cargadas localmente`);
    
    return localReservations;
  } catch (error) {
    console.error('❌ Error cargando reservas:', error);
    return [];
  }
}

export async function getSyncStatus() {
  const outbox = await getOutbox();
  const allReservations = await getAllReservationsLocal();
  const pendingReservations = allReservations.filter(r => r.pending === true);
  
  return {
    isOnline: navigator.onLine,
    pendingOperations: outbox.length,
    pendingReservations: pendingReservations.length,
    totalLocalReservations: allReservations.length,
    lastSyncAttempt: new Date().toISOString()
  };
}