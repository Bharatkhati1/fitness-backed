import passport from "passport";
import local from "passport-local";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { getSqlConnection } from "./db.js";
const { Strategy: LocalStrategy } = local;
dotenv.config({ path: ".env" });

//VERIFY USER USING LOCAL STRATEGY
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const mysql = await getSqlConnection("fitnessdb");
      const query = `SELECT * FROM User WHERE username = (?)`;
      const [user] = await mysql.promise().query(query, [username]);
      if (user.length === 0) {
        return done(null, false, { message: "Username Doesn't Exist" });
      }  else if (!user[0].isactive === 1) {
        return done(null, false, {
          message: "Your account is deactivated. Please Contact Admin",
        });
      }
      else {
        if(user[0].password == password){
          return done(null, user[0], { message: "user found" })
        }else{
          return done(null, false, { message: "Incorrect Password" });
        }
        // bcrypt.compare(password, user[0].password_hash, (err, res) => {
        //   if (err) return;
        //   if (res) return done(null, user[0], { message: "user found" });
        //   else return done(null, false, { message: "Incorrect Password" });
        // });
      }
    } catch (error) {
      console.log(error);
      return done(error);
    }
  })
);
