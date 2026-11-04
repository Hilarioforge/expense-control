// Recebe o áudio, confere o login do Firebase e transcreve com OpenAI.
// A chave Web do Firebase identifica o projeto e não é um segredo. A chave da OpenAI
// continua exclusivamente no ambiente do Netlify.
const res = (s, o) => ({ statusCode: s, headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });
const FIREBASE_API_KEY = "AIzaSyCwXJjJIlWipJc9e5Jn-nF-J4i690DzCAE";
const FIREBASE_PROJECT_ID = "expense-control-65365";

const tokenAudience = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).aud;
  } catch {
    return null;
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return res(405, { erro: "Método inválido" });
  try {
    const { audio, mime, token } = JSON.parse(event.body || "{}");
    if (!audio || !token) return res(400, { erro: "Dados faltando" });
    if (!process.env.OPENAI_API_KEY) return res(503, { erro: "Transcrição de áudio ainda não configurada." });
    if (tokenAudience(token) !== FIREBASE_PROJECT_ID) return res(401, { erro: "Sessão inválida. Entre de novo." });

    const chk = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }) }
    );
    if (!chk.ok) return res(401, { erro: "Sessão inválida. Entre de novo." });

    const buf = Buffer.from(audio, "base64");
    if (buf.length > 4 * 1024 * 1024) return res(413, { erro: "Áudio muito longo (máx. 60s)." });

    const ext = /mp4|m4a|aac/.test(mime || "")
      ? "m4a"
      : /ogg/.test(mime || "")
        ? "ogg"
        : /wav/.test(mime || "")
          ? "wav"
          : /mpeg|mp3/.test(mime || "")
            ? "mp3"
            : "webm";
    const fd = new FormData();
    fd.append("file", new Blob([buf], { type: mime || "audio/webm" }), `audio.${ext}`);
    fd.append("model", "gpt-transcribe");
    fd.append("language", "pt");
    fd.append("prompt", "Lançamento de gasto em reais. Nomes possíveis: Andrielle, Davi, Acsa e Tiago. Exemplos: mercado quinze reais; Andrielle cinquenta reais; posto de gasolina duzentos reais.");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: fd,
    });
    if (!r.ok) return res(502, { erro: "O serviço de transcrição não respondeu. Tente novamente." });
    const j = await r.json();
    return res(200, { texto: (j.text || "").trim() });
  } catch (e) {
    return res(500, { erro: "Erro interno." });
  }
};
