# 📅 Sistema de Reservas y Citas (Backend API)

API RESTful robusta y escalable para la gestión de reservas de servicios. Desarrollada con Node.js, TypeScript, Express y Prisma ORM, enfocada en la integridad de datos y la prevención de conflictos de horarios.

## 🚀 Características Principales
- **Autenticación Segura**: Registro e inicio de sesión con JWT y encriptación de contraseñas (bcrypt).
- **Motor de Disponibilidad**: Algoritmo que calcula dinámicamente los huecos libres basándose en los horarios laborales, la duración del servicio y las citas existentes.
- **Prevención de Solapamientos (Overlapping)**: Validación a nivel de base de datos y lógica de negocio para garantizar que dos citas nunca se crucen para el mismo profesional.
- **Arquitectura Limpia**: Separación de responsabilidades en Controladores, Rutas, Middlewares y Servicios.
- **Base de Datos en la Nube**: PostgreSQL (Neon) gestionada con Prisma ORM v7 y Driver Adapters.

## 🛠️ Stack Tecnológico
- **Runtime**: Node.js
- **Lenguaje**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma 7 (con `@prisma/adapter-pg`)
- **Base de Datos**: PostgreSQL (Neon)
- **Seguridad**: JSON Web Token (JWT), bcryptjs

## ⚙️ Instalación y Ejecución Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/shentew/booking-system-backend
   cd booking-system-backend