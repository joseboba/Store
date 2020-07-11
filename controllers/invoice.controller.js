"use strict";

//MODELS
var Product = require("../models/product.model");
var Category = require("../models/category.model");
var Invoice = require("../models/invoice.model");
var User = require("../models/user.model");
var moment = require("moment");

function createInvoice(req, res) {
  let adminId = req.params.idA;
  let userId = req.params.idU;
  let params = req.body;
  let invoice = new Invoice();
  let productID = params.product;
  if (adminId != req.user.sub) {
    res.status(403).send({ message: "No tiene acceso a esta ruta" });
  } else {
    User.findById(userId, (err, found) => {
      if (err) {
        res.status(found);
      } else if (found.troley.length > 0 && found.role == "CLIENT") {
        Product.findById(productID, (err, findProduct) => {
          if (err) {
            res.status(500).send(err);
          } else if (findProduct) {
            if (findProduct.stock - params.quantity >= 0) {
              var star = parseInt(findProduct.stars) + 1;
              var finalQuantity =
                parseInt(findProduct.stock) - parseInt(params.quantity);
              Product.findByIdAndUpdate(
                params.product,
                { stock: parseInt(finalQuantity), stars: star },
                { new: true },
                (err, updatedProduct) => {
                  if (err) {
                    res
                      .status(500)
                      .send({ message: "Error en el producto", err });
                  } else if (updatedProduct) {
                    invoice.fullName = found.name + found.lastname;
                    invoice.direction = found.direction;
                    invoice.date = new Date(moment().format("YYYY MM DD"));
                    invoice.nit = found.nit;
                    invoice.save((err, saved) => {
                      if (err) {
                        res.status(500).send(err);
                      } else if (saved) {
                        Invoice.findByIdAndUpdate(
                          saved._id,
                          {
                            product: {
                              products: updatedProduct,
                              quantity: params.quantity,
                            },
                          },
                          { new: true },
                          (err, invoiceFinall) => {
                            if (err) {
                              res.status(500).send(err);
                            } else if (invoiceFinall) {
                              var totalProduct =
                                parseFloat(
                                  updatedProduct.price.substring(
                                    1,
                                    updatedProduct.price.length
                                  )
                                ) * parseInt(params.quantity);
                              Invoice.findByIdAndUpdate(
                                saved._id,
                                { total: 0 },
                                { new: true },
                                (err, totalUpdate) => {
                                  if (err) {
                                    res.status(500).send(err);
                                  } else if (totalUpdate) {
                                    Invoice.findByIdAndUpdate(
                                      saved._id,
                                      { total: totalProduct },
                                      { new: true },
                                      (err, totalFinall) => {
                                        if (err) {
                                          res.status(500).send(err);
                                        } else if (totalFinall) {
                                          User.findByIdAndUpdate(
                                            userId,
                                            {
                                              $push: {
                                                invoice: invoiceFinall,
                                              },
                                            },
                                            { new: true },
                                            (err, userFinall) => {
                                              if (err) {
                                                res.status(500).send(err);
                                              } else if (userFinall) {
                                                res.send({
                                                  message:
                                                    "SE ha guardado la siguiente factura en su usuario",
                                                  userFinall,
                                                });
                                                console.log("Succes Invoice 1");
                                              } else {
                                                res.send({
                                                  message:
                                                    "No se ha guardado la factura en el usuario",
                                                });
                                              }
                                            }
                                          ).populate("invoice");
                                        }
                                      }
                                    );
                                  } else {
                                    res.send({ message: "Error innesperado" });
                                  }
                                }
                              );
                            } else {
                              res.status(403).send({
                                message: "No se pudo guardar el producto",
                              });
                            }
                          }
                        );
                      } else {
                        res.status(403).send({
                          message:
                            "No se pudo guardar el producto a la factura",
                        });
                      }
                    });
                  } else {
                  }
                }
              );
            } else {
              res.send({
                message:
                  "No puedes comprar más productos de lo que hay en stock",
              });
            }
          } else {
            res
              .status(404)
              .send({ message: "El producto no existe en la base de datos" });
          }
        });
      } else if (found.troley.length <= 0 && found.role == "CLIENT") {
        Product.findById(productID, (err, findProduct) => {
          if (err) {
            res.status(500).send(err);
          } else if (findProduct) {
            if (findProduct.stock - params.quantity >= 0) {
              User.findById(userId, (err, userFind) => {
                if (err) {
                  res.status(500).send(err);
                } else if (userFind && userFind.role == "CLIENT") {
                  Product.findByIdAndUpdate(
                    params.product,
                    { stars: 0 },
                    { new: true },
                    (err, updateStars) => {
                      if (err) {
                        res.status(500).send(err);
                      } else if (updateStars) {
                        var star = parseInt(updateStars.stars) + 1;
                        var finalQuantity =
                          parseInt(findProduct.stock) -
                          parseInt(params.quantity);
                        Product.findByIdAndUpdate(
                          params.product,
                          { stock: parseInt(finalQuantity), stars: star },
                          { new: true },
                          (err, updatedProduct) => {
                            if (err) {
                              res
                                .status(500)
                                .send({ message: "Error en el producto", err });
                            } else if (updatedProduct) {
                              if (updatedProduct.stock >= 0) {
                                invoice.fullName =
                                  userFind.name + userFind.lastname;
                                invoice.direction = userFind.direction;
                                invoice.date = new Date(
                                  moment().format("YYYY MM DD")
                                );
                                invoice.nit = userFind.nit;
                                invoice.save((err, saved) => {
                                  if (err) {
                                    res.status(500).send(err);
                                  } else if (saved) {
                                    Invoice.findByIdAndUpdate(
                                      saved._id,
                                      {
                                        product: {
                                          products: updatedProduct,
                                          quantity: params.quantity,
                                        },
                                      },
                                      { new: true },
                                      (err, invoiceFinall) => {
                                        if (err) {
                                          res.status(500).send(err);
                                        } else if (invoiceFinall) {
                                          var totalProduct =
                                            parseFloat(
                                              updatedProduct.price.substring(
                                                1,
                                                updatedProduct.price.length
                                              )
                                            ) * parseInt(params.quantity);
                                          Invoice.findByIdAndUpdate(
                                            saved._id,
                                            { total: 0 },
                                            { new: true },
                                            (err, totalUpdate) => {
                                              if (err) {
                                                res.status(500).send(err);
                                              } else if (totalUpdate) {
                                                Invoice.findByIdAndUpdate(
                                                  saved._id,
                                                  { total: totalProduct },
                                                  { new: true },
                                                  (err, totalFinall) => {
                                                    if (err) {
                                                      res.status(500).send(err);
                                                    } else if (totalFinall) {
                                                      User.findByIdAndUpdate(
                                                        userId,
                                                        {
                                                          $push: {
                                                            invoice: invoiceFinall,
                                                          },
                                                        },
                                                        { new: true },
                                                        (err, userFinall) => {
                                                          if (err) {
                                                            res
                                                              .status(500)
                                                              .send(err);
                                                          } else if (
                                                            userFinall
                                                          ) {
                                                            res.send({
                                                              message:
                                                                "SE ha guardado la siguiente factura en su usuario",
                                                              userFinall,
                                                            });
                                                            console.log(
                                                              "Invoice Succes 2"
                                                            );
                                                          } else {
                                                            res.send({
                                                              message:
                                                                "No se ha guardado la factura en el usuario",
                                                            });
                                                          }
                                                        }
                                                      ).populate("invoice");
                                                    }
                                                  }
                                                );
                                              }
                                            }
                                          );
                                        } else {
                                          res.status(403).send({
                                            message:
                                              "No se pudo guardar el producto a la factura",
                                          });
                                        }
                                      }
                                    );
                                  } else {
                                    res.status(403).send({
                                      message: "No se pudo guardar el producto",
                                    });
                                  }
                                });
                              }
                            }
                          }
                        );
                      } else {
                        res.status(404).send({
                          message: "No se pudieron actualizar las estr",
                        });
                      }
                    }
                  );
                }
              });
            } else {
              res.send({
                message: "No puedes comparar mas producto del que hay en stock",
              });
            }
          } else {
            res.status(404).send({
              message: "El producto no existe en la base de datos",
            });
          }
        });
      } else {
        res.status(406).send({
          message: "No puede asignarle una factura a un administrador",
          user: found,
        });
      }
    });
  }
}

function getInvoiceUser(req, res) {
  let adminId = req.params.idA;

  User.findById(adminId, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == "ADMIN") {
        User.find({}, (err, findInvoice) => {
          if (err) {
            res.status(500).send(err);
          } else if (findInvoice) {
            res.send({
              message: "Estos son los usuarios y sus facturas",
              findInvoice,
            });
          }
        }).populate("invoice", "invoice product.products product.quantity");
      } else {
        res.send({ message: "No tienes acceso a esta ruta" });
      }
    } else {
      res.send({
        message: "No se puede ver las facturas sin un administrador",
      });
    }
  });
}

function invoiceProduct(req, res) {
  let invoiceId = req.params.idI;
  let adminId = req.params.idA;
  User.findById(adminId, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == "ADMIN") {
        Invoice.findById(invoiceId, (err, find) => {
          if (err) {
            res.status(500).send(err);
          } else if (find) {
            res.send(find);
          } else {
            res.status(404).send({ message: "No existe esta factura" });
          }
        }).populate("product.products");
      }
    } else {
      res.send({
        message: "No se puede ver las facturas sin un administrador",
      });
    }
  });
}

module.exports = {
  createInvoice,
  getInvoiceUser,
  invoiceProduct,
};
