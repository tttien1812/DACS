import express from "express";
import homeController from "../controllers/homeController";

let router = express.Router();

// let initWebRoutes = (app) =>{
//     router.get("/",(req, res)=>{
//         return res.send('Hello world')
//     });
let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);

  return app.use("/", router);
};

module.exports = initWebRoutes;
