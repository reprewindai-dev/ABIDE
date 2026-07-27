import express from "express";
const app = express();
app.use(express.json());
app.post("/feedback", (req, res) => res.json({ success: true, recordId: "rec-991" }));
export { app };