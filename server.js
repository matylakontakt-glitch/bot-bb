import express from "express";
import multer from "multer";
import { Server } from "socket.io";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg") || ".jpg";
    cb(null, Date.now() + "-" + crypto.randomBytes(4).toString("hex") + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, /^image\//.test(file.mimetype))
});

app.use(express.json());
app.use(express.static("public"));

function fallbackMagic() {
  const titles = [
    "Fioletowy rytuał parkietu","Aura pełni księżyca","Sekret ukryty w kadrze",
    "Nocna konstelacja","Zaklęcie dobrej zabawy","Strażnicy magicznej kuli"
  ];
  const comments = [
    "Kula mówi, że energia tej ekipy dopiero się rozkręca.",
    "Ten kadr ma zdecydowanie za dużo dobrej energii, żeby był przypadkiem.",
    "Gwiazdy są zgodne: to zdjęcie zasługuje na miejsce w kronice nocy.",
    "Aura wskazuje na wysoki poziom chaosu i jeszcze wyższy poziom zabawy.",
    "Magia wykryła tutaj bardzo silne pole imprezowe."
  ];
  const auras = ["Fioletowa iskra","Złoty pył","Nocny księżyc","Gwiezdny chaos","Kryształowa moc"];
  return {
    title: titles[Math.floor(Math.random()*titles.length)],
    comment: comments[Math.floor(Math.random()*comments.length)],
    aura: auras[Math.floor(Math.random()*auras.length)],
    magic: Math.floor(Math.random()*4)+7
  };
}

async function analyzeWithOpenAI(imagePath) {
  if (!process.env.OPENAI_API_KEY) return fallbackMagic();
  try {
    const b64 = fs.readFileSync(imagePath).toString("base64");
    const ext = path.extname(imagePath).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "To zdjęcie jest z eleganckiej imprezy andrzejkowej. Stwórz WYŁĄCZNIE JSON: {\"title\":\"krótki magiczny tytuł\",\"comment\":\"zabawny, życzliwy komentarz max 18 słów\",\"aura\":\"2-3 słowa\",\"magic\":liczba 7-10}. Nie oceniaj wyglądu ciała, wieku, pochodzenia ani stanu trzeźwości." },
            { type: "input_image", image_url: `data:${mime};base64,${b64}`, detail: "low" }
          ]
        }]
      })
    });
    const data = await res.json();
    const text = data.output_text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallbackMagic();
    return JSON.parse(match[0]);
  } catch {
    return fallbackMagic();
  }
}

function mapPhoto(row, clientId = "") {
  return {
    id: row.id,
    url: row.public_url,
    nickname: row.nickname,
    title: row.title,
    comment: row.comment,
    aura: row.aura,
    magic: row.magic,
    orientation: row.orientation,
    createdAt: row.created_at,
    clientId
  };
}

app.get("/api/photos", async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || "60",10) || 60,1),100);
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: "Nie udało się pobrać galerii" });
  res.json((data || []).map(row => mapPhoto(row)));
});

app.post("/api/photos", upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Brak zdjęcia" });

  const orientation = req.body.orientation === "portrait" ? "portrait" : "landscape";
  const nickname = (req.body.nickname || "Tajemniczy Gość").slice(0, 40);
  const clientId = (req.body.clientId || "").slice(0, 80);
  const ai = await analyzeWithOpenAI(req.file.path);

  const ext = path.extname(req.file.originalname || "").toLowerCase() || ".jpg";
  const safeExt = [".jpg",".jpeg",".png",".webp"].includes(ext) ? ext : ".jpg";
  const storagePath = `event/${new Date().toISOString().slice(0,10)}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;

  try {
    const buffer = fs.readFileSync(req.file.path);
    const { error: uploadError } = await supabase.storage
      .from("andrzejki-photos")
      .upload(storagePath, buffer, {
        contentType: req.file.mimetype || "image/jpeg",
        cacheControl: "31536000",
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from("andrzejki-photos")
      .getPublicUrl(storagePath);

    const { data: inserted, error: insertError } = await supabase
      .from("photos")
      .insert({
        storage_path: storagePath,
        public_url: publicData.publicUrl,
        nickname,
        title: ai.title,
        comment: ai.comment,
        aura: ai.aura,
        magic: ai.magic,
        orientation
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    const item = mapPhoto(inserted, clientId);
    io.emit("photo:new", item);
    res.json(item);
  } catch (err) {
    console.error("Photo persistence error:", err);
    res.status(500).json({ error: "Nie udało się zapisać zdjęcia na stałe" });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

io.on("connection", async socket => {
  const { data } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);
  socket.emit("gallery:init", (data || []).map(row => mapPhoto(row)));
});

app.get("*", (_, res) => res.sendFile(path.join(process.cwd(), "public", "index.html")));

server.listen(PORT, "0.0.0.0", () => console.log("Magic app on", PORT));
