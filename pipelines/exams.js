const buildExamPipeline = ({
  keyword,
  query = {},
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Keyword Search (LIKE Match on Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    const searchConditions = [
      { examCode: { $regex: keywordRegex } },
      { title: { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: searchConditions,
      },
    });
  }

  // 3. Sorting
  pipeline.push({
    $sort: { [sortField]: sortValue === "asc" ? 1 : -1 },
  });

  // 4. Pagination (skip if "all" is true)
  if (!all) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
  }

  // 5. Projection
  if (projection && Object.keys(projection).length > 0) {
    pipeline.push({ $project: projection });
  }

  return pipeline;
};

const buildExamCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { examCode: { $regex: keywordRegex } },
          { title: { $regex: keywordRegex } },
        ],
      },
    });
  }

  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = { buildExamPipeline, buildExamCountPipeline };
