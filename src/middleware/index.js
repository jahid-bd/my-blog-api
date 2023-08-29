const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDoc = YAML.load('./swagger.yaml');
const morgan = require('morgan');
const cors = require('cors');
const OpenApiValidator = require('express-openapi-validator');
const express = require('express');
const authinticate = require('./authinticate');

const applyMiddleware = (app) => {
  app.use(express.json());

  app.use(morgan('dev'));
  app.use(cors());

  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

  app.use(authinticate);

  app.use(
    OpenApiValidator.middleware({
      apiSpec: 'swagger.yaml',
    })
  );
};

module.exports = applyMiddleware;
