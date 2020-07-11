"use strict";

//IMPORTS
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../service/jwt");

//MODELS
var Product = require("../models/product.model");
var Category = require("../models/category.model");
var Invoice = require("../models/invoice.model");
var User = require("../models/user.model");

//LOGI
function login(req, res) {
  var params = req.body;

  if ((params.username || params.email) && params.password) {
    User.findOne(
      { $or: [{ username: params.username }, { email: params.email }] },
      (err, userFind) => {
        if (err) {
          res.status(500).send(err);
        } else if (userFind) {
          bcrypt.compare(
            params.password,
            userFind.password,
            (err, password) => {
              if (err) {
                res.status(500).send(err);
              } else if (password)
                if (userFind.role == "CLIENT") {
                  res.send({
                    Bienvenido: userFind.name,
                    Comrpas: userFind.invoice,
                    token: jwt.createToken(userFind),
                  });
                  console.log(userFind.invoice.length);
                } else if (userFind.invoice.length > 0) {
                  res.send({
                    Bienvenido: userFind.name,
                    Compras: userFind.invoice,
                    token: jwt.createToken(userFind),
                  });
                } else if (userFind.role == "ADMIN") {
                  res.send({
                    Bienvenido: userFind.name,
                    token: jwt.createToken(userFind),
                  });
                }
            }
          );
        } else {
          res.status(404).send({ message: "Usuario o contraseña incorrectos" });
        }
      }
    ).populate("invoice");
  } else {
    res
      .status(404)
      .send({ message: "Ingrese los datos necesarios para iniciar sesion" });
  }
}

//ADMIN
function createAdmin(req, res) {
  let params = req.body;
  let user = new User();

  if (params.name && (params.username || params.email) && params.password) {
    User.findOne(
      { $or: [{ username: params.username }, { email: params.email }] },
      (err, find) => {
        if (err) {
          res.status(500).send(err);
        } else if (find) {
          res.send({ message: "Este usuario ya existe" });
        } else {
          User.findOne(
            { $or: [{ username: params.username }, { email: params.email }] },
            (err, find) => {
              if (err) {
                res.status(500).send(err);
              } else if (find) {
                res.send({ message: "Este administrador ya existe" });
              } else {
                if (params.code == "58600207") {
                  user.name = params.name;
                  user.lastname = params.lastname;
                  user.username = params.username;
                  user.email = params.email;
                  user.role = "ADMIN";
                  bcrypt.hash(params.password, null, null, (er, password) => {
                    if (err) {
                      res.status(500).send(err);
                    } else if (password) {
                      user.password = password;
                      user.save((err, saved) => {
                        if (err) {
                          res.status(500).send(err);
                        } else if (saved) {
                          res.send({
                            message: "Se ha creado el siguiente administrador",
                            saved,
                          });
                        } else {
                          res.status(418).send({
                            message: "No se ha guardado el administrador",
                          });
                        }
                      });
                    } else {
                      res.status(418).send({
                        message: "No se pudo encriptar la contraseña",
                      });
                    }
                  });
                } else {
                  res.send({
                    message: "Ingrese el codigo para crear un administrador",
                  });
                }
              }
            }
          );
        }
      }
    );
  } else {
    res.send({ message: "Ingrese los campos necesarios" });
  }
}

function createUser(req, res) {
  let adminId = req.params.idA;
  let params = req.body;
  let user = new User();

  User.findById(adminId, (err, findAdmin) => {
    if (err) {
      res.status(500).send(err);
    } else if (findAdmin) {
      if (adminId == req.user.sub && findAdmin.role == "ADMIN") {
        if (
          params.name &&
          params.username &&
          params.email &&
          params.phone &&
          params.nit &&
          params.direction &&
          params.password
        ) {
          User.findOne(
            {
              $or: [
                { username: params.username },
                { email: params.email },
                { nit: params.nit },
                { phone: params.phone },
              ],
            },
            null,
            (err, findUser) => {
              if (err) {
                res.status(500).send(err);
              } else if (findUser) {
                res.send({
                  message: "No puede duplicar datos de otros usuarios",
                });
              } else {
                console.log(findUser);
                user.name = params.name;
                user.lastname = params.lastname;
                user.email = params.email;
                user.username = params.username;
                user.phone = params.phone;
                user.direction = params.direction;
                user.nit = params.nit;
                user.role = "CLIENT";
                bcrypt.hash(params.password, null, null, (err, password) => {
                  if (err) {
                    res.status(500).send(err);
                  } else if (password) {
                    user.password = password;
                    user.save((err, saved) => {
                      if (err) {
                        res.status(500).send(err);
                      } else if (saved) {
                        res.send({
                          message: "Se ha guardado el usuario: ",
                          saved,
                        });
                      } else {
                        res.status(418).send({
                          message: "Este usuario no se puede guardar",
                        });
                      }
                    });
                  } else {
                    res
                      .status(418)
                      .send({ message: "No se pudo crear la contraseña" });
                  }
                });
              }
            }
          );
        } else {
          res.send({ message: "Ingrese los campos para crear un usuario" });
        }
      } else {
        res.status(403).send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res.status(404).send({
        message: "Sin administrador no puede crear un usuario cliente",
      });
    }
  });
}

function updateUser(req, res) {
  let userEdit = req.params.idE;
  let userId = req.params.idU;
  let params = req.body;

  User.findById(userEdit, (err, findUser) => {
    if (err) {
      res.status(500).send(err);
    } else if (findUser) {
      if (userEdit == req.user.sub && findUser.role == "ADMIN") {
        User.findById(userId, (err, find) => {
          if (err) {
            res.status(500).send(err);
          } else if (find.role == "ADMIN") {
            res
              .status(403)
              .send({ message: "No se puede editar un administrador" });
          } else {
            if (
              params.name &&
              params.lastname &&
              params.email &&
              params.phone &&
              params.username &&
              params.direction &&
              params.nit
            ) {
              res
                .status(403)
                .send({ message: "No pueden actualizar estos datos" });
            } else {
              User.findByIdAndUpdate(
                userId,
                { role: params.role },
                { new: true },
                (err, updatedUser) => {
                  if (err) {
                    res.status(500).send(err);
                  } else if (updatedUser) {
                    res.send({ Rol_Actualizado: updateUser.role });
                  } else {
                    res.send({ message: "No se puede actualizar el role" });
                  }
                }
              );
            }
          }
        });
      } else if (userEdit == req.user.sub && findUser.role == "CLIENT") {
        User.findOne(
          { $or: [{ username: params.username }, { email: params.email }] },
          null,
          (err, exists) => {
            if (err) {
              res.status(500).send(err);
            } else if (exists) {
              res.send({
                message:
                  "El usuario y/o correo ya han sido asignados a otro usuario",
              });
            } else {
              if (params.password) {
                bcrypt.hash(params.password, null, null, (err, password) => {
                  if (err) {
                    res.status(500).send(err);
                  } else if (password) {
                    params.password = password;
                    User.findByIdAndUpdate(
                      userId,
                      params,
                      { new: true },
                      (err, userUpdated) => {
                        if (err) {
                          res.status(500).send(err);
                        } else if (userUpdated) {
                          res.send({
                            message:
                              "Se ha actualizado con exito el siguiente usuario",
                            userUpdated,
                          });
                        } else {
                          res.status(418).send({
                            message: "No se ha podido actualizar el usuario",
                          });
                        }
                      }
                    );
                  } else {
                    res.status(418).send({
                      message: "No se ha podido encriptar la contraseña",
                    });
                  }
                });
              } else {
                User.findByIdAndUpdate(
                  userId,
                  params,
                  { new: true },
                  (err, userUpdated2) => {
                    if (err) {
                      res.status(500).send(err);
                    } else if (userUpdated2) {
                      res.send({
                        message: "Se ha actualizado con exito el usuario:",
                        userUpdated2,
                      });
                    } else {
                      res.status(418).send({
                        message: "No se ha podido actualizar los datos",
                      });
                    }
                  }
                );
              }
            }
          }
        );
      }
    } else {
      res.status(418).send({ message: "No existe este producto" });
    }
  });
}

function deleteUser(req, res) {
  let userId = req.params.idU;

  User.findById(userId, (err, findUser) => {
    if (err) {
      res.status(500).send(err);
    } else if (findUser) {
      if (userId == req.user.sub) {
        User.findById(userId, (err, find) => {
          if (err) {
            res.status(500).send(err);
          } else if (find.role == "ADMIN") {
            res
              .status(403)
              .send({ message: "No se puede eliminar un administrador" });
          } else {
            if (findUser.invoice.length > 0) {
              Invoice.deleteMany({ _id: findUser.invoice }, (err, deleted) => {
                if (err) {
                  res.status(500).send(err);
                } else if (deleted) {
                  User.findByIdAndRemove(userId, (err, userRemoved) => {
                    if (err) {
                      res.status(500).send(err);
                    } else if (userRemoved) {
                      res.send({
                        message:
                          "Se ha eliminado exitosamente el usuario y sus facturas",
                        userRemoved,
                      });
                    } else {
                      res
                        .status(404)
                        .send({ message: "El usuario ya fue eliminado" });
                    }
                  });
                } else {
                  res
                    .status(418)
                    .send({ message: "No se ha podido eliminar el usuario" });
                }
              });
            } else {
              User.findByIdAndRemove(userId, (err, userRemoved) => {
                if (err) {
                  res.status(500).send(err);
                } else if (userRemoved) {
                  res.send({
                    message: "Se ha eliminado exitosamente el usuario",
                    userRemoved,
                  });
                } else {
                  res
                    .status(404)
                    .send({ message: "El usuario ya fue eliminado" });
                }
              });
            }
          }
        });
      } else {
        res
          .status(403)
          .send({ message: "No tienes permitido acceder a esta ruta" });
      }
    } else {
      res.status(404).send({ message: "No existe el registro" });
    }
  });
}

function troley(req, res) {
  let userId = req.params.idU;
  let params = req.body;

  User.findById(userId, (err, userFind) => {
    if (err) {
      res.status(500).send(err);
    } else if (userFind) {
      if (userId == req.user.sub && userFind.role == "CLIENT") {
        Product.findById(params.product, (err, findProduct) => {
          if (err) {
            res.status(500).send(err);
          } else if (findProduct) {
            User.findOne({ troley: findProduct._id }, (err, findUserT) => {
              if (err) {
                res.status(500).send(err);
              } else if (findUserT) {
                res.send({
                  message: "No puede agregar dos veces el producto al carrito",
                });
              } else {
                User.findByIdAndUpdate(
                  userId,
                  { $push: { troley: findProduct } },
                  { new: true },
                  (err, updated) => {
                    if (err) {
                      res.status(500).send(err);
                    } else if (updated) {
                      res.send({ Agregado: updated });
                    } else {
                      res
                        .status(418)
                        .send({ message: "No se pudo guardar el producto" });
                    }
                  }
                ).populate("troley");
              }
            });
          } else {
            res.status(404).send({ message: "No existe este producto" });
          }
        });
      } else {
        res.status(403).send({ message: "No tiene acceso a esta ruta" });
        console.log(req.user);
      }
    } else {
      res.send({ message: "No se puede asginar a ningun usuario" });
    }
  });
}

function deleteTroley(req, res) {
  let userId = req.params.idU;
  let params = req.body;

  User.findById(userId, (err, userFind) => {
    if (err) {
      res.status(500).send(err);
    } else if (userFind) {
      if (userId == req.user.sub && userFind.role == "CLIENT") {
        User.findByIdAndUpdate(
          userId,
          { $unset: troley },
          { new: true },
          (err, userUpdated) => {
            if (err) {
              res.status(500).send(err);
            } else if (userUpdated) {
              res.send({ message: "Se ha eliminado el carrito", userUpdated });
            } else {
              res
                .status(418)
                .send({ message: "No se puede eliminar el carrito" });
            }
          }
        );
      } else {
        res.status(403).send({ message: "No tiene acceso a esta ruta" });
      }
    } else {
      res.send({ message: "No se puede asginar a ningun usuario" });
    }
  });
}

module.exports = {
  login,
  createAdmin,
  createUser,
  updateUser,
  deleteUser,
  troley,
  deleteTroley,
};
