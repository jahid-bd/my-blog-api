require('dotenv').config();
const express = require('express');
const swagarUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swagarDoc = YAML.load('./swagar.yaml');
const morgan = require('morgan');
const cors = require('cors');
const databaseConnection = require('./db');
const Article = require('./models/Article');
const {
  transformAritcles,
  findArticles,
  createArticle,
} = require('./services/article');
const OpenApiValidator = require('express-openapi-validator');

// automatic run the db file
require('./db');

const app = express();
app.use(express.json());

app.use(morgan('dev'));
app.use(cors());

app.use('/docs', swagarUI.serve, swagarUI.setup(swagarDoc));

app.use((req, _res, next) => {
  req.user = {
    id: 999,
    name: 'HM Nayem',
  };
  next();
});

app.use(
  OpenApiValidator.middleware({
    apiSpec: './swagar.yaml',
  })
);

app.get('/health', (req, res) => {
  res.send('<h1>This is health Route</h1>');
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Home Route' });
});

app.get('/api/v1/articles', async (req, res) => {
  // 1. extract query params
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const sortType = req.query.sort_type || 'asc';
  const sortBy = req.query.sort_by || 'updatedAt';
  const searchTerm = req.query.search || '';

  // 2. call article service to fetch all articles
  const { articles, totalItems, totalPage } = await findArticles({
    page,
    limit,
    sortBy,
    sortType,
    searchTerm,
  });

  // 3.Generate necessary responses
  const response = {
    data: transformAritcles(articles),
    paginations: {
      page,
      limit,
      totalPage,
      totalItems,
    },
    links: {
      self: `${req.url}?${page}&limit=${limit}`,
    },
  };

  if (page > 1) {
    response.paginations.prev = page - 1;
    response.links.prev = `/${req.url}?${page - 1}&limit=${limit}`;
  }

  if (page < totalPage) {
    response.paginations.next = page + 1;
    response.links.next = `/${req.url}?${page + 1}&limit=${limit}`;
  }

  res.status(200).json(response);
});

app.post('/api/v1/articles', async (req, res) => {
  // step 1: destructure the request body
  const { title, body, cover, status } = req.body;

  // step 2: invoke the service function
  const article = await createArticle({
    title,
    body,
    cover,
    status,
    authorId: req.user.id,
  });

  // step 3: generate response
  const response = {
    code: 201,
    message: 'Article created successfully',
    data: article,
    links: {
      self: `${req.url}/${article.id}`,
      author: `${req.url}/${article.id}/author`,
      comment: `${req.url}/${article.id}/comments`,
    },
  };

  res.status(201).json(response);
});

app.get('/api/v1/articles/:id', (req, res) => {
  res.status(200).json({ path: `/articles/${req.params.id}`, method: 'get' });
});

app.put('/api/v1/articles/:id', (req, res) => {
  res.status(200).json({ path: `/articles/${req.params.id}`, method: 'put' });
});

app.patch('/api/v1/articles/:id', (req, res) => {
  res.status(200).json({ path: `/articles/${req.params.id}`, method: 'patch' });
});

app.delete('/api/v1/articles/:id', (req, res) => {
  res
    .status(200)
    .json({ path: `/articles/${req.params.id}`, method: 'delete' });
});

app.post('/api/v1/auth/signup', (req, res) => {
  res.status(200).json({ path: 'auth/signup', method: 'post' });
});

app.post('/api/v1/auth/signin', (req, res) => {
  res.status(200).json({ path: 'auth/signin', method: 'post' });
});

app.use((err, req, res, next) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

(async () => {
  await databaseConnection.connect();
  console.log('database connected');
  app.listen(4000, () => {
    console.log('App is listining on port 4000');
  });
})();
