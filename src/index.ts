import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Tu asistente de agenda está funcionando");
});

function parseTextToEvent(text: string) {
  const lower = text.toLowerCase();

  const title =
    lower.includes("excursión")
      ? "Excursión"
      : lower.includes("dentista")
        ? "Dentista"
        : lower.includes("cumpleaños")
          ? "Cumpleaños"
          : lower.includes("reunión")
            ? "Reunión"
            : "Evento";

  const personMatch = text.match(/\bde\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\b/u);
  const person = personMatch?.[1];
  const fullTitle = person ? `${title} de ${person}` : title;

  const dateMatch = text.match(/\b(\d{1,2})\b/);
  const day = dateMatch?.[1]?.padStart(2, "0") ?? null;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = day ? `${year}-${month}-${day}` : null;

  const timeMatch = text.match(/\b(\d{1,2}:\d{2})\b/);
  const time = timeMatch?.[1] ?? null;

  const notes: string[] = [];
  if (lower.includes("no llevar mochila")) notes.push("No llevar mochila");
  if (lower.includes("llevar gorra")) notes.push("Llevar gorra");
  if (lower.includes("llevar agua")) notes.push("Llevar agua");
  if (lower.includes("camiseta blanca")) notes.push("Preparar camiseta blanca");

  const reminders =
    title === "Excursión" || title === "Dentista" || title === "Cumpleaños" || title === "Reunión"
      ? [
          {
            when: "day_before",
            text: `Preparar ${fullTitle}${notes.length ? `. ${notes.join(". ")}` : ""}`
          }
        ]
      : [];

  const checklist: string[] = [];
  if (title === "Excursión") checklist.push("Revisar indicaciones");
  if (notes.some((n) => n.toLowerCase().includes("mochila"))) {
    checklist.push("Recordar que no debe llevar mochila");
  }

  return {
    title: fullTitle,
    date,
    time,
    all_day: !time,
    notes: notes.join(". "),
    reminders,
    checklist
  };
}

app.post("/parse-event", (req: Request, res: Response) => {
  const text = req.body?.text;

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      ok: false,
      error: "Debes enviar un campo 'text' de tipo string"
    });
  }

  const parsed = parseTextToEvent(text);

  return res.json({
    ok: true,
    data: parsed
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});