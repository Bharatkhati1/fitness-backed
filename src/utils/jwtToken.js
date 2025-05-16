import jwt from "jsonwebtoken";

export const createJWTToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.JWTSECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log(error);
    return error;
  }
};

