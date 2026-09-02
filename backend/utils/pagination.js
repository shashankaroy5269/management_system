/**
 * Pagination helper for MongoDB queries
 * @param {number|string} page - Current page requested
 * @param {number|string} limit - Number of items per page
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const getPagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10)); // max limit cap at 100
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip
  };
};

/**
 * Format paginated response metadata
 */
export const formatPaginatedResponse = (totalItems, page, limit, data) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    data,
    pagination: {
      total: totalItems,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};
