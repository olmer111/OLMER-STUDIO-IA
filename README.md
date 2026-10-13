# Olmer Studio AI — reglas maestras del proyecto

## Objetivo
Construir Olmer Studio AI como una herramienta creativa sencilla, primero para Android, con generación de imágenes integrada, edición local y personajes visualmente consistentes.

## Reglas obligatorias
1. **No reemplazar toda la aplicación para una mejora pequeña.** Inspeccionar la estructura y cambiar únicamente el módulo necesario.
2. **Proteger la versión estable.** No publicar directamente cambios experimentales en producción.
3. **Versionar antes de modificar.** Guardar el estado actual en Git y registrar cada cambio con un commit claro.
4. **Probar en una rama/despliegue de prueba.** Verificar en móvil que la nueva función y las funciones existentes siguen funcionando antes de promover a producción.
5. **Mantener un camino de reversión.** Si una mejora falla, volver al último commit/despliegue estable.
6. **Gratis por defecto.** No comprar créditos, activar planes de pago ni aceptar cargos sin autorización explícita del usuario.
7. **Android primero.** Interfaz móvil, controles grandes, flujo guiado con tarjetas y pocas opciones visibles.
8. **Módulos independientes.** Separar interfaz de tarjetas, generador, editor, referencias/personajes y formatos cuando la arquitectura lo permita.
9. **Transparencia.** No afirmar que una función funciona o que una copia de seguridad existe hasta verificarlo.
10. **Proteger datos y claves.** Nunca poner API keys privadas en JavaScript del navegador ni en el repositorio público.
11. **Generación integrada.** Priorizar un modelo alojado con acceso gratuito y límites claros; explicar colas/cuotas. No prometer generación ilimitada.
12. **Aprobación de cambios importantes.** Antes de reemplazar arquitectura, dominio, modelo, almacenamiento o cualquier servicio de pago, explicar el impacto y pedir aprobación.

## Flujo para cada mejora
1. Identificar la versión de producción y su código.
2. Guardar el estado actual en Git.
3. Crear una rama de trabajo.
4. Hacer un cambio pequeño y específico.
5. Probar la función nueva y hacer regresión de las funciones existentes.
6. Mostrar el resultado de prueba.
7. Solo con verificación, integrar y publicar.
8. Anotar el commit, despliegue y procedimiento de reversión.

## Estado inicial
- Aplicación publicada: https://olmer-studio-ai.vercel.app
- Repositorio GitHub: https://github.com/olmer111/OLMER-STUDIO-IA
- Rama predeterminada detectada: main
- Este archivo registra las reglas del proyecto; por sí solo no es una copia completa del código fuente.
- Próximo paso: recuperar el HTML/código exacto de la última versión publicada y guardarlo en el repositorio antes de añadir funciones.
