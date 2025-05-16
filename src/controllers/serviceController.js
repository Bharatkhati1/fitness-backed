import { uploadSingle } from "../middlewares/uploadMiddleware.js";
import { deleteUploadedFiles } from "../utils/helper.js";


const SERVER_BASE_URL = process.env.SERVER_URL || "http://localhost:5000";

// @PATH    /create-services
// @METHOD  post
// @DESC    for creating services cards
export const createService = [
  uploadSingle("image"),
  async (req, res) => {
    const { name, description, is_active } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
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
      INSERT INTO services (name, description, is_active, img_url, img_name)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [name, description, is_active, imageUrl, img_name];

    req.mysql.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting slider:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      return res.status(201).json({
        message: "Service created successfully",
        sliderId: result.insertId,
        imageUrl,
      });
    });
  },
];

// @PATH    /edit-services/:id
// @METHOD  POST
// @DESC    Edit/update an existing services by ID
export const editService = [
  uploadSingle("image"), 
  async (req, res) => {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
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
      UPDATE services 
      SET name = ?, description = ?, is_active = ?
    `;
    const values = [name, description, is_active];

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
        console.error("Error updating Service:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Service not found" });
      }

      return res.status(201).json({
        message: "Service updated successfully",
        imageUrl: imageUrl || undefined,
      });
    });
  },
];

// @PATH /get-services
// @METHOD post
// Fetch sliders with pagination
export const getService = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.body;
  const offset = (page - 1) * limit;

  // Base query
  let baseQuery = `
    SELECT id, name, description, img_url, is_active, img_name
    FROM services
  `;
  let countQuery = `SELECT COUNT(*) AS total FROM services`;
  let whereClause = "";
  let queryParams = [];
  let countParams = [];

  // Add search condition if search term is provided
  if (search && search.trim() !== "") {
    whereClause = `WHERE name LIKE ? OR description LIKE ?`;
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
    console.error("Error fetching Service:", error);
    res.status(500).json({ message: "Server error fetching Service" });
  }
};

// @PATH /get-all-services
// @METHOD post
// Fetch all services  with pagination
export const getAllService = async (req, res) => {
  // const {search = "" } = req.body;

  let baseQuery = `
    SELECT id, name FROM services`;
  let whereClause = "";

  // Add search condition if search term is provided
  // if (search && search.trim() !== "") {
  //   whereClause = `WHERE name LIKE ? OR description LIKE ?`;
  //   const searchTerm = `%${search.trim()}%`;
  //   queryParams.push(searchTerm, searchTerm);
  //   countParams.push(searchTerm, searchTerm);
  // }

  baseQuery += `${whereClause} ORDER BY id DESC`;

  try {
    const [sliders] = await req.mysql.promise().query(baseQuery, []);

    res.status(200).send({
      data: sliders
    });
  } catch (error) {
    console.error("Error fetching Service:", error);
    res.status(500).json({ message: "Server error fetching Service" });
  }
};

// @PATH /:id
// @METHOD delete
// Delete services by id
export const deleteServiceById = async (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM services WHERE id = ?`;
  req.mysql.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(200).json({ message: "Service not found" });
    }
    return res.status(200).json({ message: "Service deleted successfully" });
  });
};
