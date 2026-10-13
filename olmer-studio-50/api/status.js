const names = {
  ollama: { key: "OLLAMA_API_KEY", model: process.env.OLLAMA_MODEL || "gpt-oss:20b-cloud", configured: !!process.env.OLLAMA_API_KEY },
  nvidia: { key: "NVIDIA_API_KEY", model: process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct", configured: !!process.env.NVIDIA_API_KEY },
  openrouter: { key: "OPENROUTER_API_KEY", model: process.env.OPENROUTER_MODEL || "openrouter/free", configured: !!process.env.OPENROUTER_API_KEY }
};
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Usa GET." });
  return res.status(200).json({ providers: Object.fromEntries(Object.entries(names).map(([id, p]) => [id, { configured: p.configured, keyName: p.key, model: p.model }])) });
};