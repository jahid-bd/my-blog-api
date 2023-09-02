const articleController = require('../../../../lib/ariticle');

const findSingleItem = async (req, res, next) => {
  const { id } = req.params;
  const { expand } = req.query;

  try {
    const article = await articleController.findSingleItem({ id, expand });

    const response = {
      data: article,
      links: {
        self: `/article/${id}`,
        author: `/aritcle/${id}/author`,
        comments: `/aritcle/${id}/comments`,
      },
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = findSingleItem;
