const articleService = require('../../../../lib/ariticle');
const { query } = require('../../../../utils');

const findAllItems = async (req, res, next) => {
  // 1. extract query params
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const sortType = req.query.sort_type || 'dsc';
  const sortBy = req.query.sort_by || 'updatedAt';
  const search = req.query.search || '';

  try {
    // Data
    const articles = await articleService.findAll({
      page,
      limit,
      sortType,
      sortBy,
      search,
    });

    const data = query.getTransformedItems({
      items: articles,
      path: '/articles',
      selection: ['id', 'title', 'cover', 'author', 'createdAt', 'updatedAt'],
    });

    // Pagination
    const totalItems = await articleService.count({ search });

    const pagination = query.getPagination({ limit, page, totalItems });

    // HEATOAS links
    const links = query.getHATEOASForAllItems({
      url: req.url,
      path: req.path,
      query: req.query,
      hasNext: !!pagination.next,
      hasPrev: !!pagination.prev,
      page,
    });

    res.status(200).json({ data, pagination, links });
  } catch (e) {
    next(e);
  }
};

module.exports = findAllItems;
