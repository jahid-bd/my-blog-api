const updateItem = async (req, res, next) => {
  const { id } = req.params;
  const cover = req.body.cover || '';
  const status = req.body.status || 'darft';
};
