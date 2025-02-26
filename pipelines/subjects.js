const buildSubjectPipeline = ({ query = {}, projection = false }) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (projection) {
    // 2. Projection
    const baseProjection = {
      _id: 0,
      subjectCode: 1,
      name: 1,
      createdAt: { $toLong: "$createdAt" },
      updatedAt: { $toLong: "$updatedAt" },
    };

    pipeline.push({ $project: baseProjection });
  }

  // 3. Limit the results to 1 document
  pipeline.push({ $limit: 1 });

  return pipeline;
};

const buildSubjectsPipeline = ({
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

  // 2. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex for "LIKE"

    const subjectSearchConditions = [{ name: { $regex: keywordRegex } }];

    pipeline.push({
      $match: {
        $or: subjectSearchConditions,
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

  if (projection) {
    // 5. Projection
    const baseProjection = {
      _id: 0,
      subjectCode: 1,
      name: 1,
      createdAt: { $toLong: "$createdAt" },
      updatedAt: { $toLong: "$updatedAt" },
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildSubjectCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { subjectCode: { $regex: keywordRegex } },
          { name: { $regex: keywordRegex } },
        ],
      },
    });
  }

  pipeline.push({
    $count: "totalCount",
  });

  return pipeline;
};

module.exports = {
  buildSubjectPipeline,
  buildSubjectsPipeline,
  buildSubjectCountPipeline,
};
