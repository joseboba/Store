"use strict";

//MODELS
var Product = require("../models/product.model");
var Category = require("../models/category.model");
var Invoice = require("../models/invoice.model");
var User = require("../models/user.model");

function createCategory(req, res) {
  let adminId = req.params.idA;
  let params = req.body;
  let category = new Category();

  User.findById(adminId, null, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == req.user.role) {
        if (params.name) {
          Category.findOne(
            { name: { $regex: params.name, $options: "i" } },
            (err, findC) => {
              if (err) {
                res.status(500).send(err);
              } else if (findC) {
                res.send({
                  message: "No puede crear la misma categoria dos veces",
                });
              } else {
                category.name = params.name;
                category.save((err, saved) => {
                  if (err) {
                    res.status(500).send(err);
                  } else if (saved) {
                    res.send({
                      message: "Se ha guardado la siguiente categoria",
                      saved,
                    });
                  } else {
                    res
                      .status(418)
                      .send({ message: "No se puede agregar la categoria" });
                  }
                });
              }
            }
          );
        } else {
          res.status(403).send({ message: "Ingrese los campos necesarios" });
        }
      } else {
        res.status(403).send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res
        .status(404)
        .send({ message: "Sin un administrador no puede crear una categoria" });
      ("");
    }
  });
}

function updateCategory(req, res) {
  let adminId = req.params.idA;
  let categoryId = req.params.idC;
  let params = req.body;

  User.findById(adminId, null, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == req.user.role) {
        if (params.name) {
          if (params.name == "Default" || params.name == "default") {
            res.send({
              message: "No se puede asignar este nombre a una categoria",
            });
          } else {
            Category.findById(categoryId, (err, findCategory) => {
              if (err) {
                res.status(500).send({ message: err });
              } else if ((findCategory.name = "Default")) {
                res.send({
                  message: "La categoria Default no se puede modificar",
                });
              } else if (findCategory.name != "Default") {
                Category.findByIdAndUpdate(
                  categoryId,
                  params,
                  { new: true },
                  (err, updated) => {
                    if (err) {
                      res.status(500).send(err);
                    } else if (updated) {
                      res.send({
                        message: "Se ha actualizado la categoria",
                        updated,
                      });
                    } else {
                      res.status(418).send({
                        message: "No se puede actualizar la categoria",
                      });
                    }
                  }
                );
              } else {
                Category.findByIdAndUpdate(
                  categoryId,
                  { $push: { products: params.product } },
                  { new: true },
                  (err, updated) => {
                    if (err) {
                      res.status(500).send(err);
                    } else if (updated) {
                      res.send({
                        message: "Se ha actualizado la categoria",
                        updated,
                      });
                    } else {
                      res.status(418).send({
                        message: "No se puede actualizar la categoria",
                      });
                    }
                  }
                ).populate("product");
              }
            });
          }
        } else {
          res
            .status(403)
            .send({ message: "Debe de ingresar el criterio de cambio" });
        }
      } else {
        res.status(404).send({
          message: "Sin un administrador no puede crear una categoria",
        });
      }
    }
  });
}

function deleteCategory(req, res) {
  let adminId = req.params.idA;
  let categoryId = req.params.idC;

  User.findById(adminId, null, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == req.user.role) {
        Category.findById(categoryId, null, (err, find) => {
          if (err) {
            res.status(500).send(err);
          } else if (find) {
            Category.findById(categoryId, null, (err, findCategory) => {
              if (findCategory.name == "Default") {
                res.send({
                  message: "No se puede eliminar la categoria predeterminada",
                });
              } else {
                if (err) {
                  res.status(500).send(err);
                } else if (findCategory.name == "Default") {
                  res.send({
                    message: "No puede eliminar la categoria por defecto",
                  });
                } else {
                  Category.findByIdAndRemove(categoryId, (err, deleted) => {
                    if (err) {
                      res.status(500).send(err);
                    } else if (deleted.products.length > 0) {
                      Category.findOneAndUpdate(
                        { name: "Default" },
                        { $push: { products: deleted.products } },
                        { new: true },
                        (err, updated) => {
                          if (err) {
                            res.status(500).send(err);
                          } else if (updated) {
                            res.send({
                              message: "Se ha eliminado la siguiente categoria",
                              deleted,
                              "y se asignaron los productos a": updated,
                            });
                          } else {
                            res.status(418).send({
                              message:
                                "No se han podido guardar los productos en la categoria por defecto",
                            });
                          }
                        }
                      );
                    } else {
                      res.send({
                        message: "Se ha eliminado la siguiente categoria",
                        deleted,
                      });
                    }
                  });
                }
              }
            });
          } else {
            res.status(404).send({ message: "La categoria ha sido eliminada" });
          }
        });
      } else {
        res.status(403).send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res
        .status(404)
        .send({ message: "Sin un administrador no puede crear una categoria" });
    }
  });
}

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
};
