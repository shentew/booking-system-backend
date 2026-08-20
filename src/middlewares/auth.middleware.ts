import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir nuestro usuario autenticado
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // 1. Obtener el token del encabezado "Authorization: Bearer <token>"
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_123') as { userId: string; role: string };

        // 3. Adjuntar la información del usuario a la petición
        req.user = decoded;
        next(); // Continuar a la siguiente función (el controlador)
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }
};