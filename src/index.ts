import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// 1. Middlewares (CORS configurado para CUALQUIER origen y JSON)
app.use(cors({
  origin: '*', // Permite peticiones desde Vercel, localhost, etc.
  credentials: true,
}));
app.use(express.json());

// 2. Rutas de Autenticación (¡ESTA LÍNEA FALTABA!)
app.use('/api/v1/auth', authRoutes);

// 3. Rutas de Citas
app.use('/api/v1/appointments', appointmentRoutes);

// 4. Ruta auxiliar para obtener servicios
app.get('/api/v1/services', async (req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            select: { id: true, name: true, durationMinutes: true, price: true }
        });
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener servicios.' });
    }
});

// 5. Ruta de prueba de salud del servidor
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'El servidor del Sistema de Reservas está funcionando correctamente.',
    });
});

// RUTA TEMPORAL: Asignar horario de trabajo (Solo para pruebas)
app.post('/api/v1/seed-hours', async (req: Request, res: Response) => {
    try {
        await prisma.workingHour.create({
            data: {
                userId: "272ae0d8-b9df-4595-a14e-e74effa4ef16", 
                dayOfWeek: req.body.dayOfWeek,
                startTime: "09:00:00",
                endTime: "18:00:00"
            }
        });
        res.status(200).json({ success: true, message: 'Horario creado' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`[Servidor] Corriendo en el puerto http://localhost:${PORT}`);
});