const connection = require('../db');

class Article {
  constructor(articles) {
    this.articles = articles;
  }

  // async int() {
  //   const db = await connection.getDB();
  //   this.articles = db.articles;
  // }

  async find() {
    return this.articles;
  }

  async findById(id) {
    return this.articles.filter((article) => article.id === id);
  }

  async findByProp(prop) {
    return this.articles.filter((article) => article[prop] === prop);
  }

  async search(term) {
    return (this.articles = this.articles.filter((article) =>
      article.title.toLowerCase().includes(term)
    ));
  }

  async create(article, databaseConnection) {
    article.id = this.articles[this.articles.length - 1].id + 1;
    article.createdAt = new Date().toISOString();
    article.updatedAt = new Date().toISOString();
    this.articles.push(article);

    databaseConnection.db.articles = this.articles;
    await databaseConnection.write();

    return article;
  }

  async sort(articles, sortType = 'asc', sortBy = 'updatedAt') {
    let result;

    if (sortType === 'asc') {
      result = await this.#sortAsc(articles, sortBy);
    } else {
      result = await this.#sortDsc(articles, sortBy);
    }

    return result;
  }

  async #sortAsc(articles, sortBy) {
    return articles.sort((a, b) => {
      a = a[sortBy];
      b = b[sortBy];

      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });
  }

  async #sortDsc(articles, sortBy) {
    return articles.sort((a, b) => {
      a = a[sortBy];
      b = b[sortBy];

      if (b > a) return 1;
      if (b < a) return -1;
      return 0;
    });
  }

  async pagination(articles, page, limit) {
    const totalItems = articles.length;
    const totalPage = Math.ceil(totalItems / limit);
    const start = page * limit - limit;
    const end = start + limit;
    const result = articles.slice(start, end);

    return {
      result,
      totalItems,
      totalPage,
      hasNext: page < totalPage,
      hasPrev: page > 1,
    };
  }
}

module.exports = Article;
