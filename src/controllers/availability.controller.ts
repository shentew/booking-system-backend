import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAvailability = async (req: Request, res: Response) => {
    try {
        const { staffId, serviceId, date } = req.query;

        if (!staffId || !serviceId || !date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debe proporcionar staffId, serviceId y date (YYYY-MM-DD).' 
            });
        }

        // 1. Obtener duración del servicio
        const service = await prisma.service.findUnique({ where: { id: serviceId as string } });
        if (!service) return res.status(404).json({ success: false, message: 'Servicio no encontrado.' });

        // 2. Obtener horario de trabajo del staff para ese día de la semana
        const dateObj = new Date(date as string);
        const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, etc.

        const workingHours = await prisma.workingHour.findFirst({
            where: { userId: staffId as string, dayOfWeek }
        });

        if (!workingHours) {
            return res.status(200).json({ success: true, data: { availableSlots: [], message: 'El personal no trabaja este día.' } });
        }

        // 3. Obtener citas ya reservadas para ese staff en esa fecha
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const bookedAppointments = await prisma.appointment.findMany({
            where: {
                staffId: staffId as string,
                status: { not: 'CANCELLED' },
                startTime: { gte: startOfDay },
                endTime: { lte: endOfDay }
            },
            select: { startTime: true, endTime: true }
        });

        // 4. Generar todos los posibles huecos del día
        const availableSlots: string[] = [];
        const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
        const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

        let currentTime = new Date(dateObj);
        currentTime.setUTCHours(startHour, startMinute, 0, 0);

        const dayEnd = new Date(dateObj);
        dayEnd.setUTCHours(endHour, endMinute, 0, 0);

        while (currentTime < dayEnd) {
            const slotEnd = new Date(currentTime.getTime() + service.durationMinutes * 60000);

            if (slotEnd > dayEnd) break; // El hueco se pasa del horario de cierre

            // Verificar si este hueco se solapa con alguna cita reservada
            const isOverlapping = bookedAppointments.some(booking => {
                return currentTime < booking.endTime && slotEnd > booking.startTime;
            });

            if (!isOverlapping) {
                availableSlots.push(currentTime.toISOString());
            }

            // Avanzar al siguiente hueco (ej. cada 30 mins)
            currentTime = new Date(currentTime.getTime() + service.durationMinutes * 60000);
        }

        res.status(200).json({
            success: true,
            data: {
                date: date,
                staffId: staffId,
                availableSlots: availableSlots
            }
        });

    } catch (error) {
        console.error('Error al obtener disponibilidad:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};