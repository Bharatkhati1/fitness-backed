import { uploadSingle } from "../middlewares/uploadMiddleware.js";
import { deleteUploadedFiles } from "../utils/helper.js";

const SERVER_BASE_URL = process.env.SERVER_URL || "http://localhost:5000"; 

// @PATH    /create-slider
// @METHOD  post
// @DESC    for creating slider cards
export const createSlider = [
  uploadSingle("image"), // Expecting one image field named 'image'
  async (req, res) => {
    const { name, heading, subheading, is_active } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!heading) missingFields.push("heading");
    if (typeof is_active === "undefined") missingFields.push("is_active");

    if (missingFields.length > 0) {
      // Delete uploaded file if validation fails
      if (req.file) {
        deleteUploadedFiles([req.file]);
      }

      return res.status(203).json({
        message: `Missing required field(s): ${missingFields.join(", ")}.`,
      });
    }

    // Build image URL
    let imageUrl = "";
    let img_name ="";
    if (req.file) {
      imageUrl = `${SERVER_BASE_URL}/uploads/${req.file.filename}`;
      img_name = req.file.originalname
    }

    // Insert data into DB
    const sql = `
      INSERT INTO sliders (name, heading, subheading, is_active, img_url, img_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [name, heading, subheading, is_active, imageUrl, img_name];

    req.mysql.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting slider:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      return res.status(201).json({
        message: "Slider created successfully",
        sliderId: result.insertId,
        imageUrl,
      });
    });
  },
];

// @PATH    /edit-slider/:id
// @METHOD  POST
// @DESC    Edit/update an existing slider by ID
export const editSlider = [
  uploadSingle("image"), 
  async (req, res) => {
    const { id } = req.params;
    const { name, heading, subheading, is_active } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!heading) missingFields.push("heading");
    if (typeof is_active === "undefined") missingFields.push("is_active");

    if (missingFields.length > 0) {
      if (req.file) {
        deleteUploadedFiles([req.file]);
      }
      return res.status(203).json({
        message: `Missing required field(s): ${missingFields.join(", ")}.`,
      });
    }

    let imageUrl = "";
    let img_name ="";
    if (req.file) {
      imageUrl = `${SERVER_BASE_URL}/uploads/${req.file.filename}`;
      img_name = req.file.originalname
    }

    // Build SQL update query
    let sql = `
      UPDATE sliders 
      SET name = ?, heading = ?, subheading = ?, is_active = ?
    `;
    const values = [name, heading, subheading, is_active];

    if (imageUrl) {
      sql += `, img_url = ?`;
      values.push(imageUrl);
    }
    if (img_name) {
      sql += `, img_name = ?`;
      values.push(img_name);
    }
    sql += ` WHERE id = ?`;
    values.push(id);

    req.mysql.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error updating slider:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Slider not found" });
      }

      return res.status(201).json({
        message: "Slider updated successfully",
        imageUrl: imageUrl || undefined,
      });
    });
  },
];

// @PATH /get-sliders
// @METHOD post
// Fetch sliders with pagination
export const getSliders = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.body;
  const offset = (page - 1) * limit;

  // Base query
  let baseQuery = `
    SELECT id, name, heading, subheading, img_url, is_active, img_name
    FROM sliders
  `;
  let countQuery = `SELECT COUNT(*) AS total FROM sliders`;
  let whereClause = "";
  let queryParams = [];
  let countParams = [];

  // Add search condition if search term is provided
  if (search && search.trim() !== "") {
    whereClause = `WHERE name LIKE ? OR heading LIKE ?`;
    const searchTerm = `%${search.trim()}%`;
    queryParams.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }

  // Append WHERE and pagination to the main query
  baseQuery += ` ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(limit), parseInt(offset));

  if (whereClause) {
    countQuery += ` ${whereClause}`;
  }

  try {
    const [sliders] = await req.mysql.promise().query(baseQuery, queryParams);

    const [countResult] = await req.mysql
      .promise()
      .query(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      data: sliders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sliders:", error);
    res.status(500).json({ message: "Server error fetching sliders" });
  }
};

// @PATH /:id
// @METHOD delete
// Delete slider by id
export const deleteSliderById = async (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM sliders WHERE id = ?`;
  req.mysql.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(200).json({ message: "Slider not found" });
    }
    return res.status(200).json({ message: "Slider deleted successfully" });
  });
};
