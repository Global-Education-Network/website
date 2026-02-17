import "dotenv/config";
import express from "express";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { PrismaClient } from "../prisma/generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const adapter = new PrismaPg({
  connectionString: process.env.GEN_DB_URL!,
});
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

app.post("/api/register", async (req, res) => {
  const {
    email,
    name,
    contact,
    contributions,
    contributionOther,
    donationCommitment,
    contactPermission,
    feedback,
  } = req.body;

  if (!email || !name || typeof contactPermission !== "boolean") {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  if (!Array.isArray(contributions) || contributions.length === 0) {
    res.status(400).json({ error: "Select at least one contribution option." });
    return;
  }

  try {
    const registration = await prisma.registration.create({
      data: {
        email,
        name,
        contact: contact || null,
        contributions,
        contributionOther: contributionOther || null,
        donationCommitment: donationCommitment || null,
        contactPermission,
        feedback: feedback || null,
      },
    });
    res.status(201).json({ id: registration.id });
  } catch (err: any) {
    if (err?.code === "P2002") {
      res.status(409).json({ error: "This email is already registered." });
      return;
    }
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to save registration." });
  }
});

// Serve the built frontend if it exists
const distPath = path.resolve(__dirname, "..", "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*all", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
