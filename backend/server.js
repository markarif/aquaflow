const { generatePondRecommendation } = require("./openaiService");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./authMiddleware");

dotenv.config();

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

function isAdmin(req, res) {
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access only" });
    return false;
  }
  return true;
}

app.get("/", (req, res) => {
  res.send("AquaFlow AI backend is running");
});

/* =========================
   AUTH
========================= */

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT id, full_name, email, password_hash, role, assigned_pond_id
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Login query error:", err);
      return res.status(500).json({ error: "Server error during login" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          assigned_pond_id: user.assigned_pond_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          assigned_pond_id: user.assigned_pond_id,
        },
      });
    } catch (error) {
      console.error("Password compare error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });
});

app.get("/api/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

/* =========================
   USERS CRUD
========================= */

app.get("/api/users", authenticateToken, (req, res) => {
  if (!isAdmin(req, res)) return;

  const sql = `
    SELECT id, full_name, email, role, assigned_pond_id
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    res.json(results);
  });
});

app.post("/api/users", authenticateToken, async (req, res) => {
  if (!isAdmin(req, res)) return;

  const { full_name, email, password, role, assigned_pond_id } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const allowedRoles = ["admin", "pond_manager", "staff_trainee"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (full_name, email, password_hash, role, assigned_pond_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [full_name, email, password_hash, role, assigned_pond_id || null],
      (err, result) => {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ error: "Failed to create user" });
        }

        res.status(201).json({
          message: "User created successfully",
          userId: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Hashing error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/api/users/:id", authenticateToken, (req, res) => {
  if (!isAdmin(req, res)) return;

  const { id } = req.params;
  const { full_name, email, role, assigned_pond_id } = req.body;

  if (!full_name || !email || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const allowedRoles = ["admin", "pond_manager", "staff_trainee"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const sql = `
    UPDATE users
    SET full_name = ?, email = ?, role = ?, assigned_pond_id = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [full_name, email, role, assigned_pond_id || null, id],
    (err) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Failed to update user" });
      }

      res.json({ message: "User updated successfully" });
    }
  );
});

app.put("/api/users/:id/password", authenticateToken, async (req, res) => {
  if (!isAdmin(req, res)) return;

  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    db.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [password_hash, id],
      (err) => {
        if (err) {
          console.error("Error updating password:", err);
          return res.status(500).json({ error: "Failed to update password" });
        }

        res.json({ message: "Password updated successfully" });
      }
    );
  } catch (error) {
    console.error("Password hashing error:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

app.delete("/api/users/:id", authenticateToken, (req, res) => {
  if (!isAdmin(req, res)) return;

  const { id } = req.params;

  if (Number(id) === Number(req.user.id)) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }

  db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Failed to delete user" });
    }

    res.json({ message: "User deleted successfully" });
  });
});

/* =========================
   PONDS CRUD
========================= */

app.get("/api/ponds", authenticateToken, (req, res) => {
  let sql = "SELECT * FROM ponds";
  let values = [];

  if (req.user.role !== "admin") {
    sql = "SELECT * FROM ponds WHERE id = ?";
    values = [req.user.assigned_pond_id];
  }

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching ponds:", err);
      return res.status(500).json({ error: "Failed to fetch ponds" });
    }

    res.json(results);
  });
});

app.post("/api/ponds", authenticateToken, (req, res) => {
  if (!isAdmin(req, res)) return;

  const {
    pond_name,
    location,
    fish_type,
    stocking_date,
    initial_fish_count,
    status,
  } = req.body;

  if (!pond_name) {
    return res.status(400).json({ error: "Pond name is required" });
  }

  const sql = `
    INSERT INTO ponds (
      pond_name,
      location,
      fish_type,
      stocking_date,
      initial_fish_count,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      pond_name,
      location || null,
      fish_type || null,
      stocking_date || null,
      initial_fish_count || null,
      status || "active",
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating pond:", err);
        return res.status(500).json({ error: "Failed to create pond" });
      }

      res.status(201).json({
        message: "Pond created successfully",
        pondId: result.insertId,
      });
    }
  );
});

app.put("/api/ponds/:id", authenticateToken, (req, res) => {
  if (!isAdmin(req, res)) return;

  const { id } = req.params;

  const {
    pond_name,
    location,
    fish_type,
    stocking_date,
    initial_fish_count,
    status,
  } = req.body;

  if (!pond_name) {
    return res.status(400).json({ error: "Pond name is required" });
  }

  const sql = `
    UPDATE ponds
    SET pond_name = ?, location = ?, fish_type = ?, stocking_date = ?, initial_fish_count = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      pond_name,
      location || null,
      fish_type || null,
      stocking_date || null,
      initial_fish_count || null,
      status || "active",
      id,
    ],
    (err) => {
      if (err) {
        console.error("Error updating pond:", err);
        return res.status(500).json({ error: "Failed to update pond" });
      }

      res.json({ message: "Pond updated successfully" });
    }
  );
});

app.delete("/api/ponds/:id", authenticateToken, (req, res) => {
  if (!isAdmin(req, res)) return;

  const { id } = req.params;

  db.query(
    "SELECT COUNT(*) AS total FROM users WHERE assigned_pond_id = ?",
    [id],
    (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking pond users:", checkErr);
        return res.status(500).json({ error: "Failed to validate pond deletion" });
      }

      if (checkResults[0].total > 0) {
        return res.status(400).json({
          error: "Cannot delete pond because users are assigned to it",
        });
      }

      db.query("DELETE FROM ponds WHERE id = ?", [id], (err) => {
        if (err) {
          console.error("Error deleting pond:", err);
          return res.status(500).json({ error: "Failed to delete pond" });
        }

        res.json({ message: "Pond deleted successfully" });
      });
    }
  );
});

/* =========================
   DAILY RECORDS CRUD
========================= */

app.get("/api/daily-records", authenticateToken, (req, res) => {
  let sql = `
    SELECT 
      dr.*,
      p.pond_name,
      COALESCE(u.full_name, 'Deleted User') AS recorded_by_name
    FROM daily_records dr
    JOIN ponds p ON dr.pond_id = p.id
    LEFT JOIN users u ON dr.recorded_by = u.id
  `;

  const values = [];

  if (req.user.role !== "admin") {
    sql += ` WHERE dr.pond_id = ?`;
    values.push(req.user.assigned_pond_id);
  }

  sql += ` ORDER BY dr.date DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching daily records:", err);
      return res.status(500).json({ error: "Failed to fetch daily records" });
    }

    res.json(results);
  });
});

app.post("/api/daily-records", authenticateToken, async (req, res) => {
  const {
    pond_id,
    date,
    fish_count,
    average_weight_g,
    feed_given_kg,
    water_temperature_c,
    ph,
    dissolved_oxygen,
    mortality_count,
    observations,
  } = req.body;

  const recorded_by = req.user.id;

  if (!pond_id || !date) {
    return res.status(400).json({ error: "pond_id and date are required" });
  }

  if (req.user.role !== "admin") {
    if (Number(pond_id) !== Number(req.user.assigned_pond_id)) {
      return res.status(403).json({
        error: "You can only submit records for your assigned pond",
      });
    }
  }

  const insertRecordSql = `
    INSERT INTO daily_records (
      pond_id, date, fish_count, average_weight_g, feed_given_kg,
      water_temperature_c, ph, dissolved_oxygen, mortality_count,
      observations, recorded_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const recordValues = [
    pond_id,
    date,
    fish_count,
    average_weight_g,
    feed_given_kg,
    water_temperature_c,
    ph,
    dissolved_oxygen,
    mortality_count,
    observations,
    recorded_by,
  ];

  db.query(insertRecordSql, recordValues, async (err, result) => {
    if (err) {
      console.error("Error inserting daily record:", err);
      return res.status(500).json({ error: "Failed to save daily record" });
    }

    const dailyRecordId = result.insertId;

    try {
      const aiResult = await generatePondRecommendation({
        pond_id,
        date,
        fish_count,
        average_weight_g,
        feed_given_kg,
        water_temperature_c,
        ph,
        dissolved_oxygen,
        mortality_count,
        observations,
      });

      const insertAiSql = `
        INSERT INTO ai_recommendations (
          pond_id,
          daily_record_id,
          recommendation_text,
          risk_level,
          confidence_score
        )
        VALUES (?, ?, ?, ?, ?)
      `;

      const aiValues = [
        pond_id,
        dailyRecordId,
        aiResult.recommendation_text,
        aiResult.risk_level,
        aiResult.confidence_score,
      ];

      db.query(insertAiSql, aiValues, (aiErr) => {
        if (aiErr) {
          console.error("Error saving AI recommendation:", aiErr);
          return res.status(500).json({
            error: "Daily record saved, but AI recommendation failed to save",
          });
        }

        if (aiResult.risk_level === "warning" || aiResult.risk_level === "critical") {
          const insertAlertSql = `
            INSERT INTO alerts (
              pond_id,
              daily_record_id,
              alert_type,
              severity,
              message,
              status,
              sent_to
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          const alertType =
            aiResult.risk_level === "critical"
              ? "Critical Pond Risk"
              : "Pond Warning";

          const alertMessage = aiResult.recommendation_text;

          const alertValues = [
            pond_id,
            dailyRecordId,
            alertType,
            aiResult.risk_level,
            alertMessage,
            "open",
            "Pond Manager",
          ];

          db.query(insertAlertSql, alertValues, async (alertErr, alertResult) => {
            if (alertErr) {
              console.error("Error saving alert:", alertErr);
              return res.status(500).json({
                error:
                  "Daily record and AI recommendation saved, but alert failed to save",
              });
            }

            try {
              if (process.env.N8N_ALERT_WEBHOOK_URL) {
                await axios.post(process.env.N8N_ALERT_WEBHOOK_URL, {
                  pond_id,
                  pond_name: `Pond ${pond_id}`,
                  severity: aiResult.risk_level,
                  alert_type: alertType,
                  message: alertMessage,
                  alert_id: alertResult.insertId,
                  daily_record_id: dailyRecordId,
                  created_at: new Date().toISOString(),
                });

                console.log("Alert sent to n8n successfully");
              }
            } catch (n8nError) {
              console.error(
                "Error sending alert to n8n:",
                n8nError.response?.data || n8nError.message
              );
            }

            return res.status(201).json({
              message:
                "Daily record, AI recommendation, and alert saved successfully",
              recordId: dailyRecordId,
              aiRecommendation: aiResult,
              alertCreated: true,
              alertId: alertResult.insertId,
            });
          });
        } else {
          return res.status(201).json({
            message: "Daily record and AI recommendation saved successfully",
            recordId: dailyRecordId,
            aiRecommendation: aiResult,
            alertCreated: false,
          });
        }
      });
    } catch (aiError) {
      console.error("Error generating AI recommendation:", aiError);
      return res.status(500).json({
        error: "Daily record saved, but AI recommendation failed",
      });
    }
  });
});

app.put("/api/daily-records/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const {
    pond_id,
    date,
    fish_count,
    average_weight_g,
    feed_given_kg,
    water_temperature_c,
    ph,
    dissolved_oxygen,
    mortality_count,
    observations,
  } = req.body;

  if (!pond_id || !date) {
    return res.status(400).json({ error: "pond_id and date are required" });
  }

  if (req.user.role !== "admin") {
    if (Number(pond_id) !== Number(req.user.assigned_pond_id)) {
      return res.status(403).json({
        error: "You can only edit records for your assigned pond",
      });
    }
  }

  const sql = `
    UPDATE daily_records
    SET pond_id = ?, date = ?, fish_count = ?, average_weight_g = ?, feed_given_kg = ?,
        water_temperature_c = ?, ph = ?, dissolved_oxygen = ?, mortality_count = ?, observations = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      pond_id,
      date,
      fish_count,
      average_weight_g,
      feed_given_kg,
      water_temperature_c,
      ph,
      dissolved_oxygen,
      mortality_count,
      observations,
      id,
    ],
    (err) => {
      if (err) {
        console.error("Error updating daily record:", err);
        return res.status(500).json({ error: "Failed to update daily record" });
      }

      res.json({ message: "Daily record updated successfully" });
    }
  );
});

app.delete("/api/daily-records/:id", authenticateToken, (req, res) => {
  if (!isAdmin(req, res)) return;

  const { id } = req.params;

  db.query("DELETE FROM daily_records WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting daily record:", err);
      return res.status(500).json({ error: "Failed to delete daily record" });
    }

    res.json({ message: "Daily record deleted successfully" });
  });
});

/* =========================
   AI RECOMMENDATIONS
========================= */

app.get("/api/ai-recommendations", authenticateToken, (req, res) => {
  let sql = `
    SELECT ar.*, p.pond_name
    FROM ai_recommendations ar
    JOIN ponds p ON ar.pond_id = p.id
  `;

  const values = [];

  if (req.user.role !== "admin") {
    sql += ` WHERE ar.pond_id = ?`;
    values.push(req.user.assigned_pond_id);
  }

  sql += ` ORDER BY ar.created_at DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching AI recommendations:", err);
      return res.status(500).json({ error: "Failed to fetch AI recommendations" });
    }

    res.json(results);
  });
});

/* =========================
   ALERTS
========================= */

app.get("/api/alerts", authenticateToken, (req, res) => {
  let sql = `
    SELECT a.*, p.pond_name
    FROM alerts a
    JOIN ponds p ON a.pond_id = p.id
  `;

  const values = [];

  if (req.user.role !== "admin") {
    sql += ` WHERE a.pond_id = ?`;
    values.push(req.user.assigned_pond_id);
  }

  sql += ` ORDER BY a.created_at DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching alerts:", err);
      return res.status(500).json({ error: "Failed to fetch alerts" });
    }

    res.json(results);
  });
});

app.put("/api/alerts/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["admin", "pond_manager"].includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied" });
  }

  db.query("UPDATE alerts SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) {
      console.error("Error updating alert:", err);
      return res.status(500).json({ error: "Failed to update alert" });
    }

    res.json({ message: "Alert updated successfully" });
  });
});

app.delete("/api/alerts/:id", authenticateToken, (req, res) => {
  if (!isAdmin(req, res)) return;

  const { id } = req.params;

  db.query("DELETE FROM alerts WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting alert:", err);
      return res.status(500).json({ error: "Failed to delete alert" });
    }

    res.json({ message: "Alert deleted successfully" });
  });
});

/* =========================
   REPORTS
========================= */

app.get("/api/reports/weekly-summary", authenticateToken, (req, res) => {
  let sql = `
    SELECT 
      dr.*,
      p.pond_name,
      COALESCE(u.full_name, 'Deleted User') AS recorded_by_name
    FROM daily_records dr
    JOIN ponds p ON dr.pond_id = p.id
    LEFT JOIN users u ON dr.recorded_by = u.id
    WHERE dr.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  `;

  const values = [];

  if (req.user.role !== "admin") {
    sql += ` AND dr.pond_id = ?`;
    values.push(req.user.assigned_pond_id);
  }

  sql += ` ORDER BY dr.date DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching weekly summary data:", err);
      return res.status(500).json({ error: "Failed to fetch weekly summary data" });
    }

    res.json(results);
  });
});

/* =========================
   PUBLIC LANDING PAGE
========================= */

app.get("/api/public/landing-summary", (req, res) => {
  const summarySql = `
    SELECT
      (SELECT COUNT(*) FROM ponds WHERE status = 'active' OR status IS NULL) AS activePonds,
      (SELECT COUNT(*) FROM alerts WHERE status = 'open') AS openAlerts,
      (SELECT COUNT(*) FROM daily_records) AS recordsToday
  `;

  const latestInsightSql = `
    SELECT 
      ar.recommendation_text,
      ar.risk_level,
      p.pond_name
    FROM ai_recommendations ar
    JOIN ponds p ON ar.pond_id = p.id
    ORDER BY ar.created_at DESC, ar.id DESC
    LIMIT 1
  `;

  db.query(summarySql, (summaryErr, summaryResults) => {
    if (summaryErr) {
      console.error("Landing summary error:", summaryErr);
      return res.status(500).json({ error: "Failed to load landing summary" });
    }

    db.query(latestInsightSql, (insightErr, insightResults) => {
      if (insightErr) {
        console.error("Landing insight error:", insightErr);
        return res.status(500).json({ error: "Failed to load landing insight" });
      }

      const summary = summaryResults[0] || {};

      const activePonds = Number(summary.activePonds || 0);
      const openAlerts = Number(summary.openAlerts || 0);
      const recordsToday = Number(summary.recordsToday || 0);

      const pondHealth =
        activePonds > 0
          ? Math.max(
              0,
              Math.round(((activePonds - openAlerts) / activePonds) * 100)
            )
          : 0;

      const latestInsight = insightResults[0]
        ? {
            pondName: insightResults[0].pond_name,
            riskLevel: insightResults[0].risk_level,
            text: insightResults[0].recommendation_text,
          }
        : null;

      res.json({
        metrics: {
          activePonds,
          openAlerts,
          recordsToday,
          pondHealth,
        },
        latestInsight,
      });
    });
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});