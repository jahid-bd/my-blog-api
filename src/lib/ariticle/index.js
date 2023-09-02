const { Article } = require('../../model');

const findAll = async ({
  page = 1,
  limit = 10,
  sortType = 'dsc',
  sortBy = 'updatedAt',
  search = '',
}) => {
  const sortStr = `${sortType === 'dsc' ? '-' : ''}${sortBy}`;

  const filter = {
    title: { $regex: search, $options: 'i' },
  };

  return Article.find(filter)
    .populate({ path: 'author', select: 'name' })
    .sort(sortStr)
    .skip(page * limit - limit)
    .limit(limit);
};

const generateQueryString = (query) => {
  return Object.keys(query)
    .map(
      (key) => encodeURIComponent(key) + '=' + encodeURIComponent(query[key])
    )
    .join('&');
};

const count = ({ search }) => {
  const filter = {
    title: { $regex: search, $options: 'i' },
  };
  return Article.count(filter);
};

const create = async ({
  title,
  body = '',
  cover = '',
  status = 'darft',
  author,
}) => {
  if (!title || !author) {
    const error = new Error('Invalid Paramiters!');
    error.status = 401;
    throw error;
  }

  const article = new Article({
    title,
    body,
    cover,
    status,
    author: author.id,
  });

  return await article.save();
};

const findSingleItem = async ({ id, expand = '' }) => {
  if (!id) throw Error('Is is required');

  expand = expand.split(',').map((item) => item.trim());

  const article = await Article.findById(id);

  if (!article) throw notFound();

  if (expand.includes('author')) {
    await article.populate({
      path: 'author',
      select: 'name',
      strictPopulate: false,
    });
  }

  if (expand.includes('comment')) {
    await article.populate({
      path: 'comments',
      strictPopulate: false,
    });
  }

  return {
    ...article._doc,
    id: article.id,
  };
};

module.exports = {
  findAll,
  create,
  count,
  generateQueryString,
  findSingleItem,
};
