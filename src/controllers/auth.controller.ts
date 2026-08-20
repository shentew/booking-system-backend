import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Registro de usuario
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, fullName, phone, role } = req.body;

        // 1. Validar que el usuario no exista
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
        }

        // 2. Hashear la contraseña (NUNCA guardar contraseñas en texto plano)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Crear el usuario en la base de datos
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName,
                phone,
                role: role || 'CLIENT', // Por defecto es CLIENTE
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
            }
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente.',
            data: newUser
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

// Inicio de sesión
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar al usuario
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        // 2. Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        // 3. Generar el token JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_123',
            { expiresIn: '7d' } // El token expira en 7 días
        );

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso.',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};