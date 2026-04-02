import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());

  // --- Simulation State ---
  const nodes = [
    { id: "node-1", status: "idle", performance: 0.95, load: 0.1, modelVersion: 1, logs: [] },
    { id: "node-2", status: "idle", performance: 0.92, load: 0.05, modelVersion: 1, logs: [] },
    { id: "node-3", status: "idle", performance: 0.88, load: 0.15, modelVersion: 1, logs: [] },
  ];

  let globalModel = { weights: [0.5, 0.5, 0.5], version: 1 };
  let workflows = [
    { id: "wf-1", name: "Data Ingestion Pipeline", status: "completed", progress: 100 },
    { id: "wf-2", name: "Model Training Batch", status: "running", progress: 45 },
  ];

  // --- Real-time Simulation Loop ---
  setInterval(() => {
    nodes.forEach(node => {
      // Simulate load fluctuation
      node.load = Math.max(0, Math.min(1, node.load + (Math.random() - 0.5) * 0.1));
      
      // Simulate random log generation
      if (Math.random() > 0.8) {
        const logTypes = ["INFO", "WARN", "ERROR"];
        const type = logTypes[Math.floor(Math.random() * logTypes.length)];
        const msg = type === "ERROR" ? "Memory threshold exceeded" : "Processing batch chunk";
        node.logs.push({ timestamp: new Date().toISOString(), type, message: msg });
        if (node.logs.length > 20) node.logs.shift();
      }
    });

    workflows.forEach(wf => {
      if (wf.status === "running") {
        wf.progress += Math.random() * 5;
        if (wf.progress >= 100) {
          wf.progress = 100;
          wf.status = "completed";
        }
      }
    });

    io.emit("system_update", { nodes, workflows, globalModel });
  }, 2000);

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "FIWOS" });
  });

  app.post("/api/federated/aggregate", (req, res) => {
    // Simulate Federated Averaging
    const nodeWeights = nodes.map(() => [Math.random(), Math.random(), Math.random()]);
    const avgWeights = nodeWeights[0].map((_, i) => 
      nodeWeights.reduce((acc, curr) => acc + curr[i], 0) / nodeWeights.length
    );
    
    globalModel.weights = avgWeights;
    globalModel.version += 1;
    nodes.forEach(n => n.modelVersion = globalModel.version);
    
    io.emit("federated_event", { message: "Global model aggregated", version: globalModel.version });
    res.json({ success: true, newModel: globalModel });
  });

  app.post("/api/analyze-logs", async (req, res) => {
    const { logs } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these system logs for root cause and suggest optimizations: ${JSON.stringify(logs)}`
      });
      res.json({ analysis: result.text });
    } catch (error) {
      console.error("AI analysis failed:", error);
      res.status(500).json({ error: "AI analysis failed" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`FIWOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
