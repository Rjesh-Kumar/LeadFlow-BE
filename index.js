require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// 🧩 Import Models
const SalesAgent = require("./models/SalesAgentmodel");
const Lead = require("./models/Leadmodel");
const Comment = require("./models/Commentmodel");
const Tag = require("./models/Tagmodel");

// 🔗 MongoDB Connection
const mongoUri = process.env.MONGODB;
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB connection error:", err.message));

const app = express();

// 🧩 Middleware
app.use(
  cors({
    origin: "*", // for development; restrict in production if needed
    credentials: true,
  })
);
app.use(express.json());

// 🌍 Root Route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to Anvaya CRM Backend");
});


// ============================
// 🔹 SALES AGENT ROUTES
// ============================
app.get("/agents", async (req, res) => {
  try {
    const { id } = req.query;
    const result = id
      ? await SalesAgent.findById(id)
      : await SalesAgent.find().sort({ createdAt: -1 });

    if (!result) return res.status(404).json({ error: "Agent not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/agents", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and email required" });

    const exists = await SalesAgent.findOne({ email });
    if (exists)
      return res
        .status(409)
        .json({ error: "Agent with this email already exists" });

    const agent = await SalesAgent.create({ name, email });
    res.status(201).json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/agents", async (req, res) => {
  try {
    const { id } = req.query;
    const updated = await SalesAgent.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Agent not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/agents", async (req, res) => {
  try {
    const { id } = req.query;
    const leadExists = await Lead.findOne({ salesAgent: id });
    if (leadExists)
      return res
        .status(400)
        .json({ error: "Cannot delete agent assigned to leads" });

    const deleted = await SalesAgent.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Agent not found" });
    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// 🔹 LEAD ROUTES
// ============================
app.get("/leads", async (req, res) => {
  try {
    const { id } = req.query;
    const result = id
      ? await Lead.findById(id).populate("salesAgent", "name email")
      : await Lead.find()
          .populate("salesAgent", "name email")
          .sort({ createdAt: -1 });

    if (!result) return res.status(404).json({ error: "Lead not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/leads", async (req, res) => {
  try {
    const { name, source, salesAgent, status, tags, timeToClose, priority } =
      req.body;
    if (!name || !source || !salesAgent)
      return res.status(400).json({ error: "Missing required fields" });

    const agentExists = await SalesAgent.findById(salesAgent);
    if (!agentExists)
      return res.status(404).json({ error: "Sales agent not found" });

    const lead = await Lead.create({
      name,
      source,
      salesAgent,
      status: status || "New",
      tags,
      timeToClose,
      priority,
    });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/leads", async (req, res) => {
  try {
    const { id } = req.query;
    const updated = await Lead.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Lead not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/leads", async (req, res) => {
  try {
    const { id } = req.query;
    const deleted = await Lead.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Lead not found" });
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// 🔹 COMMENT ROUTES
// ============================
app.get("/comments", async (req, res) => {
  try {
    const { leadId } = req.query;
    const filter = leadId ? { lead: leadId } : {};

    const comments = await Comment.find(filter)
      .populate("author", "name email")
      .populate("lead", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("❌ Error fetching comments:", error.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/comments", async (req, res) => {
  try {
    const { leadId, author, commentText } = req.body;
    if (!leadId || !author || !commentText)
      return res.status(400).json({ error: "Missing fields" });

    const lead = await Lead.findById(leadId);
    const agent = await SalesAgent.findById(author);
    if (!lead || !agent)
      return res.status(404).json({ error: "Lead or author not found" });

    const newComment = await Comment.create({
      lead: leadId,
      author,
      commentText,
    });
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/comments", async (req, res) => {
  try {
    const { id } = req.query;
    const { commentText } = req.body;
    if (!commentText) return res.status(400).json({ error: "Comment text is required" });

    const updated = await Comment.findByIdAndUpdate(id, { commentText }, { new: true });
    if (!updated) return res.status(404).json({ error: "Comment not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/comments", async (req, res) => {
  try {
    const { id } = req.query;
    const deleted = await Comment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Comment not found" });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// 🔹 TAG ROUTES
// ============================
app.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tags", async (req, res) => {
  try {
    const newTag = new Tag(req.body);
    await newTag.save();
    res.status(201).json(newTag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ============================
// 🔹 REPORT ROUTES
// ============================
app.get("/report/last-week", async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const leads = await Lead.find({
      status: "Closed",
      closedAt: { $gte: weekAgo },
    }).populate("salesAgent", "name");

    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/report/pipeline", async (req, res) => {
  try {
    const count = await Lead.countDocuments({ status: { $ne: "Closed" } });
    res.json({ totalLeadsInPipeline: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/report/closed-by-agent", async (req, res) => {
  try {
    const closedLeads = await Lead.aggregate([
      { $match: { status: "Closed" } },
      { $group: { _id: "$salesAgent", count: { $sum: 1 } } },
    ]);

    const results = await Promise.all(
      closedLeads.map(async (i) => {
        const agent = await SalesAgent.findById(i._id);
        return { salesAgent: agent?.name || "Unknown", closedLeadsCount: i.count };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================
// 🚀 Start Server (Local Dev)
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
