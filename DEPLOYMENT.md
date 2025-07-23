# HTK Center - Guía de Despliegue en Producción

## 🚀 Configuración para Netlify

### Requisitos previos:

1. Cuenta en Netlify
2. Repositorio conectado a Netlify
3. Variables de entorno configuradas

### Variables de Entorno en Netlify:

Configura las siguientes variables en tu panel de Netlify (Site settings > Environment variables):

```
MONGODB_URI=mongodb+srv://admin:admin123@cluster0.bbubtgd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&dbName=HtkCenterDB
GOOGLE_CLIENT_ID=886410155220-2n1kisv17cfvslbb25kfgcpbnbq00fmq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
JWT_SECRET=fitflow_jwt_secret_key_2024
JWT_EXPIRE=7d
SESSION_SECRET=fitflow_session_secret_2024
NODE_ENV=production
API_BASE_URL=/.netlify/functions/api
CLIENT_URL=https://your-app-name.netlify.app
```

### Configuración de Build:

El archivo `netlify.toml` ya está configurado con:

- Build command: `npm run build:client`
- Publish directory: `dist/spa`
- Functions directory: `netlify/functions`
- Redirects para API: `/api/*` → `/.netlify/functions/api/:splat`

### Pasos para Desplegar:

1. **Conecta tu repositorio a Netlify**
2. **Configura las variables de entorno** (ver arriba)
3. **Actualiza CLIENT_URL** con tu dominio real de Netlify
4. **Deploy automático** se ejecutará en cada push a master/main

### Funcionalidades Implementadas:

#### ✅ Sistema de Autenticación

- Login/Register con validación
- Google OAuth (configurado)
- JWT tokens para sesiones
- Roles: Admin, Profesional (Teacher/Nutritionist/Psychologist), Student

#### ✅ Gestión de Usuarios

- CRUD completo para usuarios
- Roles y permisos
- Perfil de usuario editable

#### ✅ Sistema de Planes

- Admin puede crear/editar/eliminar planes
- Códigos de descuento
- Planes públicos para la página principal
- Gestión de beneficios y precios

#### ✅ Calendario y Citas

- Calendario de 30 minutos de 8:00 AM a 8:30 PM
- Prevención de doble reserva
- Bloqueo automático de horarios pasados
- Sistema de bloqueos (por profesional y globales)
- Touch support para móviles

#### ✅ Auto-Completado de Clases

- Sistema automático para marcar clases como completadas
- Interface de administración
- Estadísticas y reportes

#### ✅ Sistema de Evaluaciones

- Estudiantes pueden calificar clases (1-5 estrellas)
- Evaluación de puntualidad y calidad
- Comentarios opcionales
- Estadísticas para profesionales
- Ranking de profesionales

#### ✅ Dashboard Administrativo

- Gestión de usuarios
- Gestión de planes
- Calendario global
- Sistema de automatización
- Evaluaciones y estadísticas

### Estructura de la Base de Datos:

- **Users**: Usuarios del sistema con roles
- **Agenda**: Clases agendadas con evaluaciones
- **PlanUsuario**: Planes individuales de estudiantes
- **Plan**: Templates de planes (admin-editable)
- **Bloqueo**: Bloqueos de horarios

### API Endpoints:

- `/api/auth/*` - Autenticación
- `/api/admin/*` - Administración de usuarios
- `/api/plans/*` - Gestión de planes
- `/api/calendario/*` - Calendario y citas
- `/api/health` - Health check

### Notas de Seguridad:

1. **Variables de entorno**: Nunca commitear secretos al repositorio
2. **JWT Secret**: Usar un secret fuerte en producción
3. **MongoDB**: Configurar IP whitelist y strong password
4. **Google OAuth**: Configurar los redirect URIs correctos

### Monitoreo:

- Health check disponible en `/api/health`
- Logs disponibles en Netlify Functions dashboard
- MongoDB Atlas para monitoreo de base de datos

### Actualización de Google OAuth:

Después del deploy, actualiza la configuración de Google OAuth:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Edita el OAuth 2.0 Client ID
4. Agrega tu dominio de Netlify a "Authorized redirect URIs":
   - `https://your-app-name.netlify.app/api/auth/google/callback`

### Solución de Problemas:

1. **404 en API calls**: Verificar redirects en netlify.toml
2. **Environment variables**: Verificar en Netlify dashboard
3. **MongoDB connection**: Verificar IP whitelist
4. **Build errors**: Verificar logs en Netlify deploy

### Comandos útiles:

```bash
# Build local
npm run build

# Test functions locally
netlify dev

# Deploy manual
netlify deploy --prod
```
