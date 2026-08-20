import { Router } from 'express';
import { createAppointment } from '../controllers/appointment.controller';
import { getAvailability } from '../controllers/availability.controller'; // <--- AGREGADO
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 1. Obtener horarios disponibles (Ruta pública para que el cliente pueda consultar antes de loguearse)
router.get('/availability', getAvailability); // <--- AGREGADO

// 2. Crear una cita (Ruta protegida: solo usuarios con token válido pueden reservar)
router.post('/', authenticate, createAppointment);

export default router;