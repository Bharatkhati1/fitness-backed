import jwt from "jsonwebtoken";

export const verifyAccessToken = (req, res, next) => {
  let token = req.headers?.authorization?.split(" ")[1] || null;
  if (token !== null) {
    jwt.verify(token, process.env.JWTSECRET, (err, user) => {
      if (err) {
        return res.status(401).send("invalid token");
      } else {
        next();
      }
    });
  } else {
    return res.status(401).send("unauthorised");
  }
};


export const verifyRefreshToken = (req, res, next) => {
  let token;
  if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
    jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
      if (err) {
        if (err.message === "jwt expired") {
          return res.status(401).send("Session Expired");
        }
        return res.status(401).send();
      } else {
        delete user.iat;
        delete user.exp;
        req.user = user;
        next();
      }
    });
  } else {
    return res.status(401).send("unauthorised");
  }
};
