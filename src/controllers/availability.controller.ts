import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const checkAvailability = async (req: Request, res: Response) => {
    try {
        const { staffId, serviceId, date } = req.query;

        if (!staffId || !serviceId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros: staffId, serviceId, date'
            });
        }

        // 1. Obtener el servicio para conocer su duración
        const service = await prisma.service.findUnique({
            where: { id: serviceId as string }
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }

        // 2. Obtener horario de trabajo del usuario para ese día de la semana
        const dateObj = new Date(date as string);
        const dayOfWeek = dateObj.getDay();

        const workingHours = await prisma.workingHour.findFirst({
            where: { userId: staffId as string, dayOfWeek }
        });

        if (!workingHours) {
            return res.status(200).json({
                success: true,
                data: { availableSlots: [] }
            });
        }

        // 3. Obtener todas las citas existentes para ese día
        const startOfDay = new Date(date as string);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date as string);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointments = await prisma.appointment.findMany({
            where: {
                staffId: staffId as string,
                startTime: { gte: startOfDay },
                endTime: { lte: endOfDay },
                status: { not: 'CANCELLED' }
            }
        });

        // 4. Generar todos los slots posibles
        const availableSlots: string[] = [];
        const startTime = new Date(`${date}T${workingHours.startTime}`);
        const endTime = new Date(`${date}T${workingHours.endTime}`);
        const durationMinutes = service.durationMinutes;

        let currentTime = startTime;

        while (currentTime < endTime) {
            const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
            
            // Verificar si este slot se solapa con alguna cita existente
            const isOverlapping = existingAppointments.some((booking: any) => {
                const bookingStart = new Date(booking.startTime);
                const bookingEnd = new Date(booking.endTime);
                
                return currentTime < bookingEnd && slotEnd > bookingStart;
            });

            if (!isOverlapping) {
                availableSlots.push(currentTime.toISOString());
            }

            currentTime = new Date(currentTime.getTime() + 30 * 60000); // Incrementar de 30 en 30 minutos
        }

        res.status(200).json({
            success: true,
            data: { availableSlots }
        });

    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};