import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const connectionCache = {};

const databaseConfig = (req, res, next) => {
  try {
    let dbname = process.env.DB_NAME;
    if (!dbname) {
      return res.status(400).send("DB Name needed");
    }

    let mysql;
    // we canimplement the master slave architecture all get on slave and write on master 
    switch (req.method) {
      case "GET": {
        if (connectionCache[dbname]) {
          if (connectionCache[dbname]["READ"]) {
            mysql = connectionCache[dbname]["READ"];
            break;
          }
        }

        mysql = getSqlConnection(dbname);
        connectionCache[dbname] = {
          ...connectionCache[dbname],
          READ: mysql,
        };
        break;
      }
      default: {
        if (connectionCache[dbname]) {
          if (connectionCache[dbname]["WRITE"]) {
            mysql = connectionCache[dbname]["WRITE"];
            break;
          }
        }

        mysql = getSqlConnectionWriter(dbname);
        connectionCache[dbname] = {
          ...connectionCache[dbname],
          WRITE: mysql,
        };

        break;
      }
    }
    req.mysql = mysql;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send("Database configuration error");
  }
};

const getSqlConnection = () => {
  // let mysqlConnection = mysqlConnectionCache.get(dbname);
  let mysqlConnection = null;
  //IF NO EXISTING CONNECTION NEED TO CREATE DBCONNECTION
  if (!mysqlConnection) {
    mysqlConnection = mysql.createPool({
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectTimeout: 30000,
      connectionLimit: 100,
      queueLimit: 0,
      multipleStatements: true,
    });
  }

  return mysqlConnection;
};

const getSqlConnectionWriter = () => {
  let mysqlConnection = null;

  //IF NO EXISTING CONNECTION NEED TO CREATE DBCONNECTION
  if (!mysqlConnection) {
    mysqlConnection = mysql.createPool({
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectTimeout: 30000,
      connectionLimit: 100,
      queueLimit: 0,
      multipleStatements: true,
    });
  }
  return mysqlConnection;
};

export { getSqlConnection, getSqlConnectionWriter };

export default databaseConfig;
