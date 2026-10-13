# Voz y audio en Olmer Studio AI

## Qué está integrado

- Panel de narración en `index.html`: texto, selector de voz, reproductor y descarga MP3.
- WaveSurfer.js 7 para visualizar la forma de onda cuando el navegador carga la biblioteca.
- `api/tts.js`: puente seguro desde Olmer Studio hacia un servidor Kokoro Web compatible con la API de audio de OpenAI.
- `api/status.js`: muestra si la URL del servidor está configurada y si la generación está habilitada.

No se han copiado ni vendorizado los archivos del proyecto Kokoro Web; Olmer se conecta a una instancia independiente. Así se puede actualizar el motor por separado.

## Variables del backend

Configurar como variables de entorno del servidor, nunca dentro de `index.html`:

- `KOKORO_BASE_URL`: URL base accesible desde el backend, por ejemplo `https://voz.tu-dominio.example` (sin barra final).
- `KOKORO_API_KEY`: la misma clave configurada como `KW_SECRET_API_KEY` en Kokoro Web.
- `KOKORO_TTS_MODEL`: opcional; por defecto `model_q8f16`.
- `KOKORO_TTS_ENABLED`: mantener ausente o en `false` hasta comprobar servidor, acceso y límites; cambiar a `true` solo cuando se quiera activar.

El endpoint `/api/tts` devuelve 503 mientras `KOKORO_TTS_ENABLED` no sea exactamente `true`. Tener la clave configurada no lo activa por sí solo.

## Servidor Linux / Docker

La vía más directa es ejecutar Kokoro Web en un equipo o servidor que admita Docker. Consultar las instrucciones actualizadas del proyecto upstream antes de instalarlo:

https://github.com/eduardolat/kokoro-web

Asegurar que el servidor esté protegido con una clave y que la URL solo sea accesible desde el backend o por HTTPS con autenticación. No publicar el puerto sin protección.

## Android con Termux

Termux puede servir para experimentar, pero no se garantiza que Kokoro Web y sus dependencias funcionen directamente en Android. Docker no suele estar disponible como en un servidor Linux convencional y la inferencia puede ser lenta, calentar el teléfono y agotar batería o memoria. No descargar modelos grandes ni dejar el teléfono expuesto a internet sin revisar recursos y seguridad.

Si Termux se usa como servidor local, Olmer debe poder llegar a su URL desde donde corre el backend. Una URL `localhost` dentro de Vercel apunta al entorno de Vercel, no al teléfono. Para conectar un servidor fuera de la red hace falta una conexión accesible y protegida; no activar túneles públicos sin autenticación.

## Licencias y coste

- Kokoro Web: MIT.
- WaveSurfer.js: BSD-3-Clause; conservar el aviso de licencia al redistribuirlo.

Las licencias no cobran por uso, pero la máquina, la electricidad, los datos móviles, el alojamiento o un túnel externo pueden tener costes. Esta integración no compra servicios ni activa generación automáticamente.

## Prueba segura

1. Desplegar los cambios y comprobar que `GET /api/status` devuelve `providers.kokoro`.
2. Configurar las variables sin habilitar la generación y comprobar que `POST /api/tts` responde 503.
3. Arrancar y proteger la instancia Kokoro, verificar manualmente su API y el acceso desde el backend.
4. Solo después de revisar los recursos y el coste, habilitar `KOKORO_TTS_ENABLED=true` y probar con una frase corta.
