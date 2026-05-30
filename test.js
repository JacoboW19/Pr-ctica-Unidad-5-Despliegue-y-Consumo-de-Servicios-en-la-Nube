require('dotenv').config();

async function descubrirModelos() {
    console.log("Conectando con Google usando tu API Key...");
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        
        console.log("\n✅ ¡Éxito! Tu llave tiene acceso a estos modelos para generar texto:\n");
        
        // Filtramos solo los que sirven para generar contenido
        datos.models.forEach(modelo => {
            if (modelo.supportedGenerationMethods.includes("generateContent")) {
                // Imprimimos el nombre limpio
                console.log("👉", modelo.name.replace('models/', ''));
            }
        });
    } catch (error) {
        console.error("Error al consultar:", error.message);
    }
}

descubrirModelos();