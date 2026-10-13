const MODEL = process.env.HF_IMAGE_MODEL || "stabilityai/stable-diffusion-3-medium-diffusers";
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Usa POST." });
  // Double opt-in: adding a token alone never enables potentially billable inference.
  if (process.env.HF_IMAGE_ENABLED !== "true") return res.status(503).json({ error: "Generación desactivada por seguridad. Primero revisa los límites de gasto de Hugging Face y activa HF_IMAGE_ENABLED=true manualmente." });
  if (!process.env.HF_TOKEN) return res.status(503).json({ error: "Falta HF_TOKEN en las variables de entorno de Vercel." });
  const { prompt } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ error: "Falta el prompt de imagen." });
  if (prompt.length > 6000) return res.status(413).json({ error: "El prompt supera 6.000 caracteres." });
  try {
    const upstream = await fetch("https://router.huggingface.co/hf-inference/models/" + MODEL, {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.HF_TOKEN, "Content-Type": "application/json", Accept: "image/*" },
      body: JSON.stringify({ inputs: prompt.trim(), options: { wait_for_model: true } })
    });
    const type = upstream.headers.get("content-type") || "";
    if (!upstream.ok || !type.startsWith("image/")) {
      const detail = type.includes("json") ? await upstream.json().catch(() => ({})) : {};
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({ error: detail.error || "Hugging Face no devolvió una imagen. Comprueba el modelo, los permisos del token y la cuota disponible." });
    }
    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (!bytes.length || bytes.length > 12 * 1024 * 1024) return res.status(502).json({ error: "La respuesta de imagen está vacía o supera 12 MB." });
    res.setHeader("Content-Type", type);
    res.setHeader("Content-Length", String(bytes.length));
    res.setHeader("X-Image-Model", MODEL);
    return res.status(200).send(bytes);
  } catch (error) {
    return res.status(502).json({ error: "No se pudo conectar con Hugging Face: " + (error.message || "error de red") });
  }
};