import passport from "passport";
import jwt from "jsonwebtoken";

import { getSqlConnection } from "../config/db.js";

// @PATH /login
// @METHOD  POST
// for login 
export const loginController = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return res.status(500).json({
        message: "something went wrong",
        err: error,
      });
    }
    if (!user) {
      return res.status(400).send({
        message: info.message,
      });
    }
    req.login(user, { session: false }, async (err) => {
      if (err) res.status(500).send("Internal server error");
      try {
        user.password_hash = undefined;
        const [localUserData] = await getSqlConnection("fitnessdb")
          .promise()
          .query("SELECT * FROM User Where username=?", [user.username]);

          console.log(process.env.JWTSECRET, process.env.REFRESH_SECRET)
        const accessToken = jwt.sign(user, process.env.JWTSECRET, {
          expiresIn: "4h",
        });
        const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET, {
          expiresIn: "4h",
        });

        return res
          .status(200)
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 14400000,
          })
          .json({
            user: {
              ...user,
              ...localUserData,
            },
            accessToken,
          });
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
      }
    });
  })(req, res, next);

};

export const generateNewAccessToken = async (req, res) => {
  try {
    // console.log(req.user);
    const [globalUserData] = await getSqlConnection("fitnessdb")
      .promise()
      .query("SELECT *  FROM User WHERE username= ? ", [req.user.username]);

    if (!globalUserData[0].isactive) {
      throw new Error("Your account is De-Activated. Please Contact Admin");
    }

    const accessToken = jwt.sign(req.user, process.env.JWTSECRET, {
      expiresIn: "4h",
    });
    const refreshToken = jwt.sign(req.user, process.env.REFRESH_SECRET, {
      expiresIn: "4h",
    });

    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 14400000,
      })
      .json({
        user: {
          ...req.user,
          ...globalUserData,
        },
        accessToken,
      });
  } catch (error) {
    const errorMessage = error.message || "Internal server error";
    res.status(500).send(errorMessage);
  }
};

export const signupNewUser = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error);
  }
};

// @PATH /logout
// @METHOD  GET
//FOR LOGGING OUT USER
//NEED TO CLEAR COOKIE STORED IN BROWSER
export const logoutController = (_, res) => {
  return res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .send();
};
