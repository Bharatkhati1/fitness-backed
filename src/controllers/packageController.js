import { uploadSingle } from "../middlewares/uploadMiddleware.js";
import { deleteUploadedFiles } from "../utils/helper.js";

const SERVER_BASE_URL = process.env.SERVER_URL || "http://localhost:5000";

// @METHOD POST
// @DESC   Create package in db by admin
export const createPackage = [
  uploadSingle("image"),
  async (req, res) => {
    const { name, price, type, service_type_id, description, is_active } =
      req.body;
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (!service_type_id || service_type_id == "null")
      missingFields.push("service_type_id");
    if (!type || typeof type !== "string" || type.trim().length === 0)
      missingFields.push("type");
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
    let img_name = "";
    if (req.file) {
      imageUrl = `${SERVER_BASE_URL}/uploads/${req.file.filename}`;
      img_name = req.file.originalname;
    }

    const query = `
      INSERT INTO packages
      (name, price, type, service_type_id, description, is_active, img_name, img_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      name,
      Number(price),
      type,
      Number(service_type_id),
      description,
      Number(is_active),
      img_name,
      imageUrl,
    ];

    req.mysql.query(query, values, (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      return res.status(201).json({
        message: "Package created successfully",
        packageId: result.insertId,
      });
    });
  },
];

// @Route  /:id
// @METHOD PUT
// @DESC   Update package in db by admin
export const updatePackage = [
  uploadSingle("image"),
  async (req, res) => {
    const { name, price, type, service_type_id, description, is_active } =
      req.body;
    const { id } = req.params;

    let query = `UPDATE packages SET name = ?, price = ?, type = ?, service_type_id = ?, description = ?, is_active = ? `;
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (!service_type_id || service_type_id == "null")
      missingFields.push("service_type_id");
    if (!type || typeof type !== "string" || type.trim().length === 0)
      missingFields.push("type");
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
    let img_name = "";
    if (req.file) {
      imageUrl = `${SERVER_BASE_URL}/uploads/${req.file.filename}`;
      img_name = req.file.originalname;
    }

    const values = [
      name,
      Number(price),
      type,
      Number(service_type_id),
      description,
      Number(is_active),
    ];

    if (imageUrl) {
      query += `, img_url = ?`;
      values.push(imageUrl);
    }
    if (img_name) {
      query += `, img_name = ?`;
      values.push(img_name);
    }
    query += ` WHERE id = ?`;
    values.push(Number(id));
    req.mysql.query(query, values, (err, result) => {
      if (err) {
        return res.status(500).send({ message: "Database error", error: err });
      }
      return res.status(201).send({ message: "Package Upadted successfully" });
    });
  },
];

// @METHOD GET
// @DESC   Get all created packages by admin
export const getAllPackages = async (req, res) => {
  req.mysql.query(
    `Select packages.*, services.name as service_name from packages inner join services on service_type_id = services.id;`,
    (err, result) => {
      if (err) res.status(500).send({ message: "Internal Server Error" });
      res.status(200).send({ status: "success", data: result });
    }
  );
};

// @PATH /:id
// @METHOD delete
// Delete package by id
export const deletePackageById = async (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM packages WHERE id = ?`;
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
