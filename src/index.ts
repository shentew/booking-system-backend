import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes'; // <--- IMPORTANTE

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Rutas de Autenticación
app.use('/api/v1/auth', authRoutes);

// 2. Rutas de Citas (Protegidas por middleware)
app.use('/api/v1/appointments', appointmentRoutes); // <--- IMPORTANTE

// 3. Ruta auxiliar para obtener servicios (Necesaria para la prueba)
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

// 4. Ruta de prueba de salud del servidor
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'El servidor del Sistema de Reservas está funcionando correctamente.',
    });
});

app.listen(PORT, () => {
    console.log(`[Servidor] Corriendo en el puerto http://localhost:${PORT}`);
});