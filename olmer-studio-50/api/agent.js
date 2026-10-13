const PROVIDERS = {
  ollama: { url: "https://ollama.com/v1/chat/completions", key: process.env.OLLAMA_API_KEY, model: process.env.OLLAMA_MODEL || "gpt-oss:20b-cloud" },
  nvidia: { url: "https://integrate.api.nvidia.com/v1/chat/completions", key: process.env.NVIDIA_API_KEY, model: process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct" },
  openrouter: { url: "https://openrouter.ai/api/v1/chat/completions", key: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL || "openrouter/free" }
};
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Usa POST." });
  const { provider, prompt, style, format } = req.body || {};
  const config = PROVIDERS[provider];
  if (!config) return res.status(400).json({ error: "Proveedor no válido." });
  if (!config.key) return res.status(503).json({ error: "Proveedor sin configurar en el servidor. Añade su API key como variable de entorno en Vercel." });
  if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ error: "Falta el prompt." });
  if (prompt.length > 120000) return res.status(413).json({ error: "El documento supera el límite de 120.000 caracteres. Divídelo en partes." });
  const system = `Eres el agente director de producción de Olmer Studio AI. Analiza guiones largos y devuelve ÚNICAMENTE JSON válido con forma {"title":"...","scenes":[{"number":1,"start":"00:00","end":"00:03","duration_seconds":3,"voice":"...","visual_prompt":"...","camera":"...","motion":"...","continuity":"..."}]}. REGLAS CRÍTICAS: no confundas líneas con escenas. Un encabezado numerado como "228 — 3 s (09:27–09:30)" inicia una escena; las líneas siguientes de Voz, Prompt Flow, descripción, cámara y notas pertenecen a ESA misma escena hasta el siguiente encabezado. Conserva los números y tiempos originales cuando existan. Si el texto contiene 228 encabezados de escena, devuelve 228 escenas, nunca una por cada línea. No inventes escenas nuevas. Si no hay encabezados claros, agrupa párrafos relacionados en unidades narrativas coherentes. No omitas escenas por límite de salida; si no puedes devolver todas, indica "partial":true y "next_scene_number". Idioma de metadatos español; conserva el idioma original dentro de visual_prompt cuando proceda. Estilo visual: ${style || "Cinemático 3D"}. Formato: ${format || "9:16"}.`;
  try {
    const upstream = await fetch(config.url, {
      method: "POST",
      headers: { "Authorization": "Bearer " + config.key, "Content-Type": "application/json", ...(provider === "openrouter" ? { "HTTP-Referer": "https://olmer-studio-ai.vercel.app", "X-Title": "Olmer Studio AI" } : {}) },
      body: JSON.stringify({ model: config.model, temperature: 0.1, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], response_format: { type: "json_object" } })
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status >= 500 ? 502 : upstream.status).json({ error: data.error?.message || data.message || "El proveedor rechazó la solicitud." });
    let content = data.choices?.[0]?.message?.content;
    if (Array.isArray(content)) content = content.map(x => x.text || "").join("");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.scenes)) return res.status(502).json({ error: "El modelo no devolvió una lista de escenas válida." });
    return res.status(200).json({ title: parsed.title || "Producción analizada", scenes: parsed.scenes, partial: !!parsed.partial, next_scene_number: parsed.next_scene_number || null, provider, model: config.model });
  } catch (e) {
    return res.status(502).json({ error: "No se pudo completar el análisis: " + (e.message || "error de conexión") });
  }
};