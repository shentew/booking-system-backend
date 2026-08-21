import { Router } from 'express';
import { createAppointment } from '../controllers/appointment.controller';
import { checkAvailability } from '../controllers/availability.controller'; // <-- CORREGIDO
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 1. Obtener horarios disponibles (Ruta pública)
router.get('/availability', checkAvailability); // <-- CORREGIDO

// 2. Crear una cita (Ruta protegida)
router.post('/', authenticate, createAppointment);

export default router;