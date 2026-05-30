#  Análisis de Arquitectura Cloud
---
## 1. Tipos de Servicio en la Nube (IaaS, PaaS, SaaS)

En nuestro ecosistema de desarrollo, interactuamos principalmente con servicios PaaS y SaaS.

| Componente del Proyecto | Modelo de Servicio | Justificación Técnica |
| :--- | :--- | :--- |
| **Vercel** (Hosting/Despliegue) | **PaaS** *(Platform as a Service)* | Vercel abstrae la infraestructura subyacente (servidores, redes, SO). Nosotros solo entregamos el código fuente (Next.js) y la plataforma compila, aprovisiona recursos y despliega globalmente. |
| **API de Google (Gemini)** | **SaaS / APIaaS** *(Software/API as a Service)* | Consumimos un producto final gestionado. No configuramos clústeres ni entrenamos el modelo; enviamos datos a un endpoint y recibimos un servicio listo para usar. |
| **GitHub** (Control de Versiones) | **SaaS** *(Software as a Service)* | Plataforma web para alojar código y colaborar, sin tener que mantener un servidor Git propio. |

---

## 2. Estándares e Interoperabilidad

Para que nuestro servidor web (backend) y la API de la nube (Google) puedan comunicarse de forma universal, utilizan **JSON (JavaScript Object Notation)** como estándar de interoperabilidad.

### ¿Por qué JSON es el estándar?
1. **Agnóstico al Lenguaje:** Cualquier lenguaje moderno tiene librerías nativas para parsear y serializar JSON de forma casi instantánea.
2. **Ligero y Legible:** Al estar basado en texto plano con una estructura de clave-valor (`"key": "value"`), consume poco ancho de banda y es fácil de depurar por un humano.
3. **Estructuras Complejas:** Permite anidar datos, ideal para enviar historiales de chat a una API de IA.

**Ejemplo de Interoperabilidad (Payload):**
```json
// Request (Servidor -> API de IA)
{
  "model": "gemini-1.5-flash",
  "contents": [
    { "role": "user", "parts": [{ "text": "Analiza estos datos médicos" }] }
  ]
}

// Response (API de IA -> Servidor)
{
  "candidates": [
    { "content": { "parts": [{ "text": "El análisis indica que..." }] } }
  ]
}
```

---

## 3. Seguridad: Protección de API Keys y Variables de Entorno

> **Vulnerabilidad Crítica:** Exponer una clave de API directamente en el frontend es el equivalente a dejar las llaves de producción públicas. Cualquier usuario o bot puede extraerla inspeccionando el navegador o el repositorio.

### Riesgos Principales
* **Secuestro de Facturación:** Explotación automatizada de cuotas, generando costos elevados.
* **Denegación de Servicio (Rate Limits):** Saturación del límite de peticiones, inhabilitando la app para usuarios legítimos.

### El Peligro de GitHub y el archivo `.env`
Si un archivo `.env` se sube a un repositorio público en GitHub, bots maliciosos extraerán tus credenciales en segundos. 
* **Solución:** El archivo `.env` **siempre** debe estar incluido en el archivo `.gitignore` para que nunca se suba a la nube.

### El Patrón Proxy y la Inyección en Vercel (PaaS)

La comunicación directa desde el navegador a la IA debe reemplazarse por una capa intermedia en el backend:

```text
[ Frontend / Cliente ]  ──► (Petición sin credenciales) ──►  [ Tu Backend Seguro ]
                                                                   │
    [ API de Google Gemini ]  ◄── (Inyección de API Key oculta) ───┘
```

Dado que el PaaS (ej. Vercel) no recibe el archivo `.env` desde GitHub, las credenciales se configuran de forma segura mediante la **Inyección de Entorno en Tiempo de Ejecución**:
1. Entramos al Dashboard de Vercel.
2. Navegamos a **Environment Variables**.
3. Ingresamos manualmente las claves (Ej. `GEMINI_API_KEY`).
4. **Resultado:** Al compilar, Vercel inyecta estos secretos de forma encriptada en el servidor. El código accede a ellas vía `process.env.GEMINI_API_KEY`, garantizando que la clave viva en el servidor, pero nunca en el repositorio público ni en el navegador.
