const pagination = (items, offset = 0, limit = 10) => {
  if (!items || items.length < 1) return items;
  const totalPage = Math.ceil(items.length / limit);
  const result = items.slice((offset - 1) * limit, offset * limit);
  return {
    data: result,
    totalPage: totalPage
  };
};
export default pagination;
