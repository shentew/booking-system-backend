import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const { staffId, serviceId, startTime, notes } = req.body;
        const clientId = req.user!.userId; // Obtenido del token, ¡seguro!

        // 1. Obtener la duración del servicio para calcular la hora de fin
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service || !service.isActive) {
            return res.status(404).json({ success: false, message: 'Servicio no encontrado o inactivo.' });
        }

        const start = new Date(startTime);
        const end = new Date(start.getTime() + service.durationMinutes * 60000); // Sumar minutos en milisegundos

        // 2. VALIDACIÓN CRÍTICA: Prevenir solapamientos (Overlapping)
        // Una cita se solapa si: (NuevoInicio < ExistenteFin) Y (NuevoFin > ExistenteInicio)
        const overlappingAppointment = await prisma.appointment.findFirst({
            where: {
                staffId: staffId,
                status: { not: 'CANCELLED' }, // Ignorar citas canceladas
                OR: [
                    {
                        AND: [
                            { startTime: { lt: end } },   // El inicio de la nueva es antes del fin de la existente
                            { endTime: { gt: start } }    // El fin de la nueva es después del inicio de la existente
                        ]
                    }
                ]
            }
        });

        if (overlappingAppointment) {
            return res.status(409).json({ 
                success: false, 
                message: 'El horario seleccionado no está disponible. Ya existe una cita en ese rango de tiempo.' 
            });
        }

        // 3. Crear la cita si todo está correcto

        const newAppointment = await prisma.appointment.create({
            data: {
                clientId,
                staffId,
                serviceId,
                startTime: start,
                endTime: end,
                notes: notes || null,
                status: 'CONFIRMED',
            },
            include: {
                client: { select: { fullName: true, email: true } },
                staff: { select: { fullName: true, email: true } }, // <-- CORREGIDO: Apunta directo a User
                service: { select: { name: true, price: true } }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Cita reservada exitosamente.',
            data: newAppointment
        });

    } catch (error) {
        console.error('Error al crear la cita:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};