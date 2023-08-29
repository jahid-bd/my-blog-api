require('dotenv').config();
const express = require('express');
const swagarUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swagarDoc = YAML.load('./swagar.yaml');
const morgan = require('morgan');
const cors = require('cors');
const connection = require('./db');

// automatic run the db file
require('./db');

const app = express();
app.use(express.json());

app.use(morgan('dev'));
app.use(cors());

app.use('/docs', swagarUI.serve, swagarUI.setup(swagarDoc));

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
  const db = await connection.getDB();
  const originalArticles = db.articles;
  let articles = [...db.articles];

  // filter based on search term
  if (searchTerm) {
    articles = articles.filter((article) =>
      article.title.toLowerCase().includes(searchTerm)
    );
  }

  // sorting
  articles.sort((a, b) => {
    a = a[sortBy];
    b = b[sortBy];

    // if(sortType === 'dsc') return b.localCompare()

    if (sortType === 'asc') {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    } else {
      if (b > a) return 1;
      if (b < a) return -1;
      return 0;
    }
  });

  // pagination
  const totalItems = originalArticles.length;
  const totalPage = Math.ceil(totalItems / limit);
  const start = page * limit - limit;
  const end = start + limit;
  articles = articles.slice(start, end);

  // 3.Generate necessary responses
  const transformAritcles = articles.map((article) => {
    const transformed = {
      ...article,
    };
    transformed.author = {
      id: transformed.authorId,
    };

    transformed.link = `articles/${transformed.id}`;

    delete transformed.body;
    delete transformed.authorId;

    return transformed;
  });

  const response = {
    data: transformAritcles,
    paginations: {
      page,
      limit,
      totalPage,
      totalItems,
    },
    links: {
      self: `/articles?${page}&limit=${limit}`,
    },
  };

  if (page > 1) {
    response.paginations.prev = page - 1;
    response.links.prev = `/articles?${page - 1}&limit=${limit}`;
  }

  if (page < totalPage) {
    response.paginations.next = page + 1;
    response.links.next = `/articles?${page + 1}&limit=${limit}`;
  }

  res.status(200).json(response);
});

app.post('/api/v1/articles', (req, res) => {
  res.status(200).json({ path: '/articles', method: 'post' });
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

app.listen(4000, () => {
  console.log('App is listining on port 4000');
});
