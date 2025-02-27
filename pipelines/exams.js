const buildExamPipeline = ({ query = {}, projection = false }) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // Step 2: Limit to 1 document
  pipeline.push({ $limit: 1 });

  // 3. Projection
  if (projection) {
    pipeline.push({
      $project: {
        _id: 0,
        examCode: 1,
        title: 1,
        date: { $toLong: "$date" },
        createdAt: { $toLong: "$createdAt" },
        updatedAt: { $toLong: "$updatedAt" },
      },
    });
  }

  return pipeline;
};

const buildExamsPipeline = ({
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
    const searchConditions = [{ title: { $regex: keywordRegex } }];

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
  if (projection) {
    pipeline.push({
      $project: {
        _id: 0,
        examCode: 1,
        title: 1,
        date: { $toLong: "$date" },
        createdAt: { $toLong: "$createdAt" },
        updatedAt: { $toLong: "$updatedAt" },
      },
    });
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
        $or: [{ title: { $regex: keywordRegex } }],
      },
    });
  }

  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = {
  buildExamPipeline,
  buildExamsPipeline,
  buildExamCountPipeline,
};
