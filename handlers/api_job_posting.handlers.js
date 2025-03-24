const { db,} = require("../lib/database");

const createJobPosting = async (req, res) => {
  try {
    const { client_id, title, description, location, urgency, date, min_budget, max_budget, notify } = req.body;

    console.log("📡 Received Job Posting Request:", req.body);

    // Validate required fields
    if (!client_id || !title || !description || !location || !urgency || !date) {
      console.error("❌ Missing required fields");
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Ensure date is valid
    if (isNaN(Date.parse(date))) {
      console.error("❌ Invalid date format");
      return res.status(400).json({ error: "Invalid date format. Please provide a valid date." });
    }

    // Convert budgets to float or set to null
    const parsedMinBudget = min_budget ? parseFloat(min_budget) : null;
    const parsedMaxBudget = max_budget ? parseFloat(max_budget) : null;

    // Ensure min_budget is not greater than max_budget
    if (parsedMinBudget !== null && parsedMaxBudget !== null && parsedMinBudget > parsedMaxBudget) {
      console.error("❌ min_budget cannot be greater than max_budget");
      return res.status(400).json({ error: "Minimum budget cannot be greater than maximum budget." });
    }

    // Insert job posting into database
    const query = `
      INSERT INTO job_postings (client_id, title, description, location, urgency, date, min_budget, max_budget, notify) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      client_id,
      title.trim(),
      description.trim(),
      location.trim(),
      urgency,
      new Date(date),
      parsedMinBudget,
      parsedMaxBudget,
      notify ? 1 : 0,
    ];

    const [result] = await db.promise().query(query, values);
    console.log("✅ Job Posting Created:", result.insertId);

    res.status(201).json({ message: "Job request created successfully!", job_id: result.insertId });
  } catch (error) {
    console.error("🔥 Error inserting job request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchJobPosting = async (req, res) => {
    try {
      console.log("📡 Fetching Job Postings...");
  
      // Fetch all job postings from database
      const query = `
        SELECT id, client_id, title, description, location, urgency, date, min_budget, max_budget, notify, status, created_at
        FROM job_postings
        ORDER BY created_at DESC;
      `;
  
      const [results] = await db.promise().query(query);
  
      if (!results.length) {
        console.warn("⚠️ No job postings found.");
        return res.status(404).json({ error: "No job postings available." });
      }
  
      console.log("✅ Job Postings Retrieved:", results.length);
      res.status(200).json(results);
    } catch (error) {
      console.error("🔥 Error fetching job postings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const fetchJobPostingByUserId = async (req, res) => {
    try {
      const { userId } = req.params; // Extract userId from the URL parameters
  
      console.log(`📡 Fetching Job Postings for User ID: ${userId}`);
  
      // Validate userId
      if (!userId || isNaN(parseInt(userId, 10))) {
        console.error("❌ Invalid user ID");
        return res.status(400).json({ error: "Invalid user ID." });
      }
  
      // Fetch job postings for the given userId from the database
      const query = `
        SELECT id, client_id, title, description, location, urgency, date, min_budget, max_budget, notify, status, created_at
        FROM job_postings
        WHERE client_id = ?
        ORDER BY created_at DESC;
      `;
  
      const [results] = await db.promise().query(query, [userId]);
  
      if (!results.length) {
        console.warn(`⚠️ No job postings found for User ID: ${userId}`);
        return res.status(404).json({ error: "No job postings available for this user." });
      }
  
      console.log(`✅ Job Postings Retrieved for User ID ${userId}:`, results.length);
      res.status(200).json(results); // Return the fetched job postings
    } catch (error) {
      console.error("🔥 Error fetching job postings by user ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
module.exports = { createJobPosting, fetchJobPosting, fetchJobPostingByUserId };
