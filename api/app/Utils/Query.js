'use strict';

const Query = {
  async builder(query, request) {
    let {
      sortBy,
      descending,
      paginate,
      page,
      perPage,
      where,
      orWhere,
      whereIn,
      whereNotIn,
      whereNotNull,
      whereBetween,
      whereNotBetween,
      search,
      searchField,
      select,
      relations
    } = request.all();

    // Seteo valores por defectos
    descending = descending || 'DES';
    paginate = paginate === 'false' ? false : true;
    select = select ? select : '*';
    relations = relations ? relations : [];
    where = where ? where : [];
    orWhere = orWhere ? orWhere : [];
    whereIn = whereIn ? whereIn : [];
    whereNotIn = whereNotIn ? whereNotIn : [];
    whereNotNull = whereNotNull ? whereNotNull : null;
    whereBetween = whereBetween ? whereBetween : [];
    whereNotBetween = whereNotBetween ? whereNotBetween : [];

    // Campos seleccionados
    query.select(select);

    // Modelos relacionados (Es necesario traer en select clave foranea)
    if (search && searchField) {
      query.where(searchField, 'like', `%${search}%`);
    }

    // Modelos relacionados (Es necesario traer en select clave foranea)
    if (relations.length > 0) {
      relations.forEach(relation => {
        query.with(relation);
      });
    }

    // Agrego filtro por condiciones
    if (where.length > 0) {
      where.forEach(item => {
        item = JSON.parse(item);
        if (item.length === 3) {
          query.where(item[0], item[1], item[2]);
        }
      });
    }

    if (orWhere.length > 0) {
      orWhere.forEach(item => {
        item = JSON.parse(item);
        if (item.length === 3) {
          query.orWhere(item[0], item[1], item[2]);
        }
      });
    }

    if (whereBetween.length > 0) {
      whereBetween.forEach(item => {
        item = JSON.parse(item);
        if (item.length === 3) {
          query.whereBetween(item[0], [item[1], item[2]]);
        }
      });
    }

    if (whereNotBetween.length > 0) {
      whereNotBetween.forEach(item => {
        item = JSON.parse(item);
        if (item.length === 3) {
          query.whereNotBetween(item[0], [item[1], item[2]]);
        }
      });
    }

    if (whereNotIn.length > 0) {
      whereNotIn.forEach(item => {
        item = JSON.parse(item);
        if (item.length === 2) {
          query.whereNotIn(item[0], item[2]);
        }
      });
    }

    if (whereNotNull) {
      query.whereNotNull(whereNotNull);
    }

    if (whereIn.length > 0) {
      whereIn.forEach(item => {
        item = JSON.parse(item);
        if (item.length === 2) {
          query.whereIn(item[0], item[1]);
        }
      });
    }

    // Agrego ordenamiento a la consulta
    if (sortBy && descending) {
      query.orderBy(sortBy, descending);
    }

    // Verifico si se pagina o no
    if (paginate) {
      return query.paginate(page, perPage);
    } else {
      let data = await query.fetch();
      data = data.toJSON();

      return { total: data.length, perPage: data.length, page: 1, lastPage: 1, data: data };
    }
  }
};

module.exports = Query;
