'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 
const moment = require('moment'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);

    registrarPersona(PersonaObj(requestBody))
    .then(res => {
        callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            message: `La Persona  ${requestBody.nombre} se registro correctamente`,
            PersonaId: res.id
        })
        });
    })
    .catch(err => {
        console.log(err);
        callback(null, {
        statusCode: 500,
        body: JSON.stringify({
            message: `Error al registrar al Persona ${requestBody.nombre}`
        })
        })
    });

};

const registrarPersona = Persona => {
  const PersonaTable = {
    TableName: process.env.PERSONAS_TABLE,
    Item: Persona,
  };
  return dynamoDb.put(PersonaTable).promise()
    .then(res => Persona);
};

const PersonaObj = (requestBody) => {
  const date = new Date();
  return {
    id: uuid.v1(),
    edad: requestBody.edad,
    color_ojos: requestBody.color_ojos,
    peliculas: requestBody.peliculas,
    genero: requestBody.genero,
    color_pelo: requestBody.color_pelo,
    altura: requestBody.altura,
    mundo_natal: requestBody.mundo_natal,
    peso: requestBody.peso,
    nombre: requestBody.nombre,
    color_piel: requestBody.color_piel,
    especies: requestBody.especies,
    naves_estelares: requestBody.naves_estelares,
    vehiculos: requestBody.vehiculos,
    link: "https://2q1zwhsxt2.execute-api.us-east-1.amazonaws.com/dev/personas/" + uuid.v1(),
    creado: moment(date).format(),
    editado: moment(date).format(),
  };
};

//Listar Todos

module.exports.list = (event, context, callback) => {
    var params = {
        TableName: process.env.PERSONAS_TABLE,
        ProjectionExpression: "edad, color_ojos, peliculas, genero, color_pelo, altura, mundo_natal, peso, nombre, color_piel, creado, editado, especies, naves_estelares, link, vehiculos"
    };
    const onScan = (err, data) => {
        if (err) {
            console.log('Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    personas: data.Items
                })
            });
        }

    };
    dynamoDb.scan(params, onScan);
};

//Búsqueda por ID

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.PERSONAS_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('No se pudo encontrar a la Persona'));
      return;
    });
};