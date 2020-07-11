"use strict";

//MODELS
var Product = require("../models/product.model");
var Category = require("../models/category.model");
var Invoice = require("../models/invoice.model");
var User = require("../models/user.model");

function createProduct(req, res) {
  let adminId = req.params.idA;
  let params = req.body;
  let name = "Default";
  let product = new Product();

  User.findById(adminId, null, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == "ADMIN") {
        if (
          params.name &&
          params.description &&
          params.price &&
          params.stock &&
          params.provider
        ) {
          Category.findOne({ name: "Default" }, (err, find) => {
            if (err) {
              res.status(500).send(err);
            } else if (find) {
              Product.findOne(
                { name: params.name, provider: params.provider },
                (err, findProduct) => {
                  if (err) {
                    res.status(500).send(err);
                  } else if (findProduct) {
                    res.send({
                      message:
                        "El mismo proovedor no puede agregar el mismo producto más de una vez",
                    });
                  } else {
                    product.name = params.name;
                    product.description = params.description;
                    product.price = params.price;
                    product.stock = params.stock;
                    product.provider = params.provider;
                    product.stars = 0;
                    product.save((err, saved) => {
                      if (err) {
                        res.status(500).send(err);
                      } else if (saved) {
                        Category.findOneAndUpdate(
                          { name: "Default" },
                          { $push: { products: product } },
                          { new: true },
                          (err, added) => {
                            if (err) {
                              res.send(err);
                            } else if (added) {
                              res.send({
                                message:
                                  "Se ha agregado con exito el siguiente producto:",
                                saved,
                              });
                            } else {
                              res.status(418).send({
                                message:
                                  "No se pudo agregar el producto a la categoria por defecto",
                              });
                            }
                          }
                        );
                      } else {
                        res.send({
                          message: "Hubo problemas a para guardar el producto",
                        });
                      }
                    });
                  }
                }
              );
            } else {
              res.send({
                message:
                  "Debe crear primero una categoria por defecto para que se guarden los productos",
              });
            }
          });
        } else {
          res.send({ message: "Debe ingresar los datos necesarios" });
        }
      } else {
        res.status(403).send({ message: "No tiene acceso a la ruta" });
      }
    } else {
      res
        .status(404)
        .send({ message: "Sin un administrador no puede crear un producto" });
    }
  });
}

function getProducts(req, res) {
  let userId = req.params.userId;
  User.findById(userId, (err, findUser) => {
    if (err) {
      res.status(500).send(err);
    } else if (findUser) {
      if (userId == req.user.sub && findUser.role == "CLIENT") {
        Product.find({}, (err, find) => {
          if (err) {
            res.status(500).send(err);
          } else if (find) {
            res.send({
              message: "Estos son los productos que se han encontrado:",
              find,
            });
          } else {
            res.send({ message: "No hay registros" });
          }
        });
      } else {
        res.send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res.send({ message: "No puede acceder sin un CLIENT" });
    }
  });
}

function getPrice(req, res) {
  let search = req.body;
  let userId = req.params.userId;

  User.findById(userId, (err, findUser) => {
    if (err) {
      res.status(500).send(err);
    } else if (findUser) {
      if (userId == req.user.sub && findUser.role == "CLIENT") {
        if (search.search == "MIN") {
          Product.find({}, null, { sort: { price: 1 } }, (err, find) => {
            if (err) {
              res.status(500).send(err);
            } else if (find) {
              res.send({
                message:
                  "Lista de productos por precio del mas barato al mas caro",
                find,
              });
            } else {
              res.status(404).send({ message: "No hay registros aun" });
            }
          });
        } else if (search.search == "MAX") {
          Product.find({}, null, { sort: { price: -1 } }, (err, find) => {
            if (err) {
              res.status(500).send(err);
            } else if (find) {
              res.send({
                message:
                  "Lista de productos por precio del mas caro al mas barato",
                find,
              });
            } else {
              res.status(404).send({ message: "No hay registros aun" });
            }
          });
        }
      } else {
        res.send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res.send({ message: "No puede acceder sin un CLIENT" });
    }
  });
}

function searchProduct(req, res) {
  let params = req.body;
  let userId = req.params.userId;
  User.findById(userId, (err, findUser) => {
    if (err) {
      res.status(500).send(err);
    } else if (findUser) {
      if (userId == req.user.sub && findUser.role == "CLIENT") {
        Product.find(
          {
            $or: [
              { name: { $regex: "^" + params.search, $options: "i" } },
              { provider: { $regex: "^" + params.search, $options: "i" } },
              { description: { $regex: "^" + params.search, $options: "i" } },
            ],
          },
          (err, products) => {
            if (err) {
              res.status(500).send(err);
            } else if (products) {
              res.send({
                message:
                  "Se han encontrado coincidencias con los siguientes productos",
                products,
              });
            } else {
              res.status(404).send({ message: "No hay usuarios" });
            }
          }
        );
      } else {
        res.send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res.send({ message: "No puede acceder sin un CLIENT" });
    }
  });
}

function range(req, res) {
  let range = req.body;
  let userId = req.params.userId;
  User.findById(userId, (err, findUser) => {
    if (err) {
      res.status(500).send(err);
    } else if (findUser) {
      if (userId == req.user.sub && findUser.role == "CLIENT") {
        if (range.range == "PRICE") {
          if (range.price) {
            Product.find(
              { price: { $lte: range.price } },
              { sort: { price: -1 } },
              (err, find) => {
                if (err) {
                  res.status(500).send(err);
                } else if (find) {
                  res.send({
                    message: "Este es el rango de precios segun su criterio:",
                    find,
                  });
                } else {
                  res.status(404).send({
                    message: "Nada cumple con su criterio de busqueda",
                  });
                }
              }
            );
          } else {
            res.send({ message: "Ingrese su criterio de busqueda" });
          }
        } else if (range.range == "STOCK") {
          if (range.stock) {
            Product.find(
              { stock: { $lte: range.stock } },
              { sort: { stock: -1 } },
              (err, find) => {
                if (err) {
                  res.status(500).send(err);
                } else if (find) {
                  res.send({
                    message:
                      "Este es el rango de los productos que tienen este stock, segun su criterio:",
                    find,
                  });
                } else {
                  res.status(404).send({
                    message: "Nada cumple con su criterio de busqueda",
                  });
                }
              }
            );
          } else {
            res.send({ message: "Ingrese su criterio de busqueda" });
          }
        }
      } else {
        res.send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res.send({ message: "No puede acceder sin un CLIENT" });
    }
  });
}

function updateProduct(req, res) {
  let adminId = req.params.idA;
  let params = req.body;
  let productId = req.params.idP;

  User.findById(adminId, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == "ADMIN") {
        if (params.stock) {
          Product.findById(productId, (err, findP) => {
            if (err) {
              res.status(500).send(err);
            } else if (findP) {
              var newStock = findP.stock + params.stock;
              Product.findByIdAndUpdate(
                productId,
                { stock: newStock, params },
                (err, updated) => {
                  if (err) {
                    res.status(500).send(err);
                  } else if (updated) {
                    res.send({
                      message: "Se ha actualizado con exito el producto",
                      updated,
                    });
                  } else {
                    res.send({ message: "No se ha actualizado el producto" });
                  }
                }
              );
            } else {
              res
                .status(404)
                .send({ message: "No hay coincidencias con ese ID" });
            }
          });
        } else {
          Product.findById(productId, (err, findP) => {
            if (err) {
              res.status(500).send(err);
            } else if (findP) {
              Product.findByIdAndUpdate(productId, params, (err, updated) => {
                if (err) {
                  res.status(500).send(err);
                } else if (updated) {
                  res.send({
                    message: "Se ha actualizado con exito el producto",
                    updated,
                  });
                } else {
                  res.send({ message: "No se ha actualizado el producto" });
                }
              });
            } else {
              res
                .status(404)
                .send({ message: "No hay coincidencias con ese ID" });
            }
          });
        }
      } else {
        res.status(500).send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res
        .status(404)
        .send({ message: "No puede actualizar el producto sin administrador" });
    }
  });
}

function removeProduct(req, res) {
  let adminId = req.params.idA;
  let productId = req.params.idP;

  User.findById(adminId, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == "ADMIN") {
        Product.findByIdAndRemove(productId, (err, removed) => {
          if (err) {
            res.status(500).send(err);
          } else if (removed) {
            Category.updateMany(
              { products: productId },
              { $pull: { products: productId } },
              { new: true },
              (err, removedPro) => {
                if (err) {
                  res.status(500).send(err);
                } else if (removedPro) {
                  User.updateMany(
                    { troley: productId },
                    { $pull: { troley: productId } },
                    { new: true },
                    (err, removedProduct) => {
                      if (err) {
                        res.status(500).send(err);
                      } else if (removedProduct) {
                        res.send({
                          message: "Se ha eliminado el siguiente producto",
                          removed,
                        });
                      } else {
                        Invoice.updateMany(
                          { product: { products: productId } },
                          { $pull: { product: { products: productId } } },
                          { new: true },
                          (err, removedProdu) => {
                            if (err) {
                              res.status(500).send(err);
                            } else if (removedProdu) {
                              res.send({
                                message:
                                  "Se ha eliminado el siguiente producto",
                                removed,
                              });
                            } else {
                              res.send({
                                message:
                                  "Se ha eliminado el siguiente producto",
                                removed,
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  res.send({
                    message: "No se logró eliminar de ninguna categoria",
                  });
                }
              }
            );
          } else {
            res.status(404).send({ message: "Este producto ya fue eliminado" });
          }
        });
      } else {
        res.status(403).send({ message: "Peticion sin autenticacion" });
      }
    } else {
      res.status(404).send({
        message: "No se puede eliminar un usuario sin un administrador",
      });
    }
  });
}

function moreBougth(req, res) {
  let userId = req.params.userId;
  User.findById(userId, (err, findUser) => {
    if (err) {
      res.status(500).send(err);
    } else if (findUser) {
      if (userId == req.user.sub && findUser.role == "ADMIN") {
        Product.find({}, null, { sort: { stars: -1 } }, (err, find) => {
          if (err) {
            res.status(500).send(err);
          } else if (find) {
            res.send({ message: "Estos son los productos más comprados" });
          } else {
            res.status(404).send({ message: "Aún no hay registros" });
          }
        });
      } else {
        res.send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res.send({ message: "No puede acceder sin un ADMIN" });
    }
  });
}

function exhausted(req, res) {
  let userId = req.params.userId;

  User.findById(userId, (err, findUser) => {
    if (err) {
      res.status(500).send(err);
    } else if (findUser) {
      if (userId == req.user.sub && findUser.role == "ADMIN") {
        Product.find({ stock: 0 }, (err, find) => {
          if (err) {
            res.status(500).send(err);
          } else if (find) {
            res.send({
              message: "Estos son los productos que estan agotados",
              find,
            });
          } else {
            res.status(404).send({ message: "No hay registros" });
          }
        });
      } else {
        res.send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res.send({ message: "No puede acceder sin un CLIENT" });
    }
  });
}

module.exports = {
  createProduct,
  getProducts,
  getPrice,
  searchProduct,
  range,
  updateProduct,
  removeProduct,
  moreBougth,
  exhausted,
};
