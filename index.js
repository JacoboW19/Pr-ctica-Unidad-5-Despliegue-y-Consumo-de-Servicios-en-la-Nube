require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generar', async (req, res) => {
    const temaUsuario = req.body.tema; // El campo del textarea se llama 'tema' en tu HTML

    if (!temaUsuario) {
        return res.send("Error: No se recibió ninguna propuesta.");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Analiza esta propuesta técnica de IA y genera un dato curioso relacionado o una breve opinión de viabilidad: ${temaUsuario}`;
        
        const result = await model.generateContent(prompt);
        const respuestaIA = result.response.text();

        // Enviamos el HTML con el diseño institucional
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Resultado IA | ITCM</title>
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body>
                <header class="cabecera-principal">
                    <div class="etiqueta-estado" style="border-color: #2e7d32; color: #2e7d32;">Procesamiento Finalizado</div>
                    <h1>Respuesta de Gemini API</h1>
                </header>

                <main class="contenedor-formulario" style="border-top-color: var(--color-secondary);">
                    <div class="seccion-datos">
                        <legend>Análisis de la Propuesta</legend>
                        <p style="color: var(--color-muted); font-size: 0.9rem; margin-bottom: 20px;">
                            Sobre el tema: <strong>"${temaUsuario}"</strong>
                        </p>
                        
                        <div class="code-block" style="background-color: #fff; border-left: 5px solid var(--color-primary); padding: 25px; box-shadow: inset 0 0 10px rgba(0,0,0,0.02);">
                            <p style="color: var(--color-text); line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap;">${respuestaIA}</p>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="/" id="btn-procesar" style="text-decoration: none; display: inline-block; width: auto; padding: 12px 40px;">
                            ← Volver al Registro
                        </a>
                    </div>
                </main>

                <footer style="margin-top: auto;">
                    <span>Build with AI – ITCM</span> &nbsp;·&nbsp; Práctica Unidad 5 &nbsp;·&nbsp; Cloud Computing
                </footer>
            </body>
            </html>
        `);
    } catch (error) {
        res.send(`
            <div style="font-family: sans-serif; padding: 40px; text-align: center;">
                <h2 style="color: #c62828;">Ocurrió un error en la nube</h2>
                <p>${error.message}</p>
                <a href="/">Intentar de nuevo</a>
            </div>
        `);
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
}

module.exports = app;