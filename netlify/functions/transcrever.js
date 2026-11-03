// Recebe o áudio, confere o login do Firebase e transcreve com OpenAI (chaves ficam só no servidor).
const res = (s, o) => ({ statusCode: s, headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return res(405, { erro: "Método inválido" });
  try {
    const { audio, mime, token } = JSON.parse(event.body || "{}");
    if (!audio || !token) return res(400, { erro: "Dados faltando" });

    const chk = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }) }
    );
    if (!chk.ok) return res(401, { erro: "Sessão inválida. Entre de novo." });

    const buf = Buffer.from(audio, "base64");
    if (buf.length > 4 * 1024 * 1024) return res(413, { erro: "Áudio muito longo (máx. 60s)." });

    const ext = /mp4|m4a|aac/.test(mime || "") ? "m4a" : /ogg/.test(mime || "") ? "ogg" : "webm";
    const fd = new FormData();
    fd.append("file", new Blob([buf], { type: mime || "audio/webm" }), `audio.${ext}`);
    fd.append("model", "whisper-1");
    fd.append("language", "pt");
    fd.append("prompt", "Lançamento de gasto em reais. Exemplos: mercado quinze reais; posto de gasolina duzentos reais.");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: fd,
    });
    if (!r.ok) return res(502, { erro: "Falha na transcrição." });
    const j = await r.json();
    return res(200, { texto: (j.text || "").trim() });
  } catch (e) {
    return res(500, { erro: "Erro interno." });
  }
};
