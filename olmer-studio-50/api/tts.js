const MODEL = process.env.KOKORO_TTS_MODEL || "model_q8f16";
const ALLOWED_VOICES = new Set([
  "af_heart", "af_bella", "af_nicole", "af_sarah", "af_sky",
  "am_adam", "am_michael", "bf_emma", "bf_isabella", "bm_george", "bm_lewis"
]);
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Usa POST." });
  // Dos interruptores: el servidor debe existir y el usuario debe activar TTS explícitamente.
  if (process.env.KOKORO_TTS_ENABLED !== "true") {
    return res.status(503).json({ error: "Voz desactivada. No se ejecutará ningún procesamiento hasta configurar el servidor Kokoro y activar KOKORO_TTS_ENABLED=true." });
  }
  const base = (process.env.KOKORO_BASE_URL || "").trim().replace(/\/+$/, "");
  const apiKey = process.env.KOKORO_API_KEY;
  if (!base || !apiKey) return res.status(503).json({ error: "Faltan KOKORO_BASE_URL o KOKORO_API_KEY en el servidor." });
  const { text, voice } = req.body || {};
  if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "Escribe el texto que quieres narrar." });
  if (text.length > 6000) return res.status(413).json({ error: "El texto supera 6.000 caracteres por solicitud." });
  const selectedVoice = typeof voice === "string" && ALLOWED_VOICES.has(voice) ? voice : "af_heart";
  try {
    const upstream = await fetch(base + "/api/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ model: MODEL, voice: selectedVoice, input: text.trim(), response_format: "mp3" })
    });
    const type = upstream.headers.get("content-type") || "";
    if (!upstream.ok || !type.startsWith("audio/")) {
      const detail = type.includes("json") ? await upstream.json().catch(() => ({})) : {};
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({
        error: detail.error?.message || detail.error || "Kokoro no devolvió audio. Verifica URL, voz, modelo y clave del servidor."
      });
    }
    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (!bytes.length || bytes.length > 25 * 1024 * 1024) return res.status(502).json({ error: "El audio está vacío o supera 25 MB." });
    res.setHeader("Content-Type", type);
    res.setHeader("Content-Length", String(bytes.length));
    res.setHeader("Content-Disposition", 'inline; filename="olmer-narracion.mp3"');
    return res.status(200).send(bytes);
  } catch (error) {
    return res.status(502).json({ error: "No se pudo contactar el servidor Kokoro. Comprueba que sea accesible desde este backend." });
  }
};
