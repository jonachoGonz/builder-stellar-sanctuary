# Configuración de Google OAuth para HTK Center

## Estado Actual
✅ **Client ID configurado**: `886410155220-2n1kisv17cfvslbb25kfgcpbnbq00fmq.apps.googleusercontent.com`
❌ **Client Secret**: Necesario para completar la configuración

## Pasos para obtener el Client Secret

### 1. Accede a Google Cloud Console
Ve a: https://console.cloud.google.com/

### 2. Selecciona el proyecto que tiene el Client ID configurado
- El Client ID `886410155220-2n1kisv17cfvslbb25kfgcpbnbq00fmq` debe pertenecer a un proyecto específico

### 3. Ve a APIs & Services > Credentials
- En el panel izquierdo, busca "APIs & Services"
- Haz clic en "Credentials"

### 4. Busca tu OAuth 2.0 Client ID
- Busca en la lista el Client ID que termina en `886410155220-2n1kisv17cfvslbb25kfgcpbnbq00fmq`
- Haz clic en el ícono de editar (lápiz)

### 5. Copia el Client Secret
- En la página de edición, verás el "Client Secret"
- Cópialo y guárdalo de forma segura

### 6. Actualiza la configuración
Reemplaza en el archivo `.env`:
```
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
```

Por:
```
GOOGLE_CLIENT_SECRET=tu_client_secret_real_aqui
```

### 7. Configura las URIs de redirección
En la misma página de configuración de OAuth, asegúrate de que las siguientes URIs estén configuradas:

**Para desarrollo local:**
- `http://localhost:8080/api/auth/google/callback`

**Para producción (cuando implementes):**
- `https://tudominio.com/api/auth/google/callback`

## Verificación

Una vez configurado el Client Secret, puedes verificar el estado visitando:
`http://localhost:8080/api/auth/google/status`

Deberías ver:
```json
{
  "success": true,
  "configured": true,
  "message": "Google OAuth está configurado correctamente"
}
```

## Funcionalidades incluidas

✅ **Login con Google**: Los usuarios pueden iniciar sesión con su cuenta de Google
✅ **Registro automático**: Si es la primera vez, se crea automáticamente una cuenta
✅ **Vinculación de cuentas**: Si el usuario ya existe con el mismo email, se vincula la cuenta de Google
✅ **Información de perfil**: Se obtiene automáticamente nombre, apellido, email y foto de perfil
✅ **Seguridad**: Tokens JWT para autenticación posterior

## Flujo de autenticación

1. Usuario hace clic en "Continuar con Google"
2. Se redirige a Google para autenticación
3. Google redirige de vuelta con los datos del usuario
4. Se crea o actualiza la cuenta del usuario
5. Se genera un token JWT
6. Usuario es redirigido al dashboard

## Notas importantes

- Los usuarios que se registren con Google no necesitan contraseña
- Si completan el perfil posteriormente, pueden agregar información adicional como teléfono, fecha de nacimiento, etc.
- El rol por defecto para nuevos usuarios es "student"
- El plan por defecto es "trial"
