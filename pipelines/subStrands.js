const buildSubStrandPipeline = ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Limit the results to 1 document
  pipeline.push({ $limit: 1 });

  // 3. Lookup (populate strand)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "strands",
        localField: "strand",
        foreignField: "_id",
        as: "strand",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$strand",
        preserveNullAndEmptyArrays: true,
      },
    });
  }

  if (projection) {
    // 4. Projection (Include-Only Fields)
    const baseProjection = {
      _id: 0,
      subStrandCode: 1,
      title: 1,
      strand: populate
        ? {
            strandCode: "$strand.strandCode",
            title: "$strand.title",
            createdAt: { $toLong: "$strand.createdAt" },
            updatedAt: { $toLong: "$strand.updatedAt" },
          }
        : 1,
      createdAt: { $toLong: "$createdAt" },
      updatedAt: { $toLong: "$updatedAt" },
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildSubStrandsPipeline = ({
  keyword,
  query = {},
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  populate = false,
  all = false,
}) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Lookup (populate strand)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "strands",
        localField: "strand",
        foreignField: "_id",
        as: "strand",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$strand",
        preserveNullAndEmptyArrays: true,
      },
    });
  }

  // 2. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex for "LIKE"

    // Dynamic search conditions for sub strand fields
    const subStrandSearchConditions = [{ title: { $regex: keywordRegex } }];
    const strandSearchConditions = [
      { "strand.title": { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: [...subStrandSearchConditions, ...strandSearchConditions],
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
    // 5. Projection (Include-Only Fields)
    const baseProjection = {
      _id: 0,
      subStrandCode: 1,
      title: 1,
      strand: populate
        ? {
            strandCode: "$strand.strandCode",
            title: "$strand.title",
            createdAt: { $toLong: "$strand.createdAt" },
            updatedAt: { $toLong: "$strand.updatedAt" },
          }
        : 1,
      createdAt: { $toLong: "$createdAt" },
      updatedAt: { $toLong: "$updatedAt" },
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildSubStrandCountPipeline = ({ keyword, query = {}, populate }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (populate) {
    pipeline.push({
      $lookup: {
        from: "strands",
        localField: "strand",
        foreignField: "_id",
        as: "strand",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$strand",
        preserveNullAndEmptyArrays: true,
      },
    });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex for "LIKE"

    // Dynamic search conditions for sub strand fields
    const subStrandSearchConditions = [{ title: { $regex: keywordRegex } }];
    const strandSearchConditions = [
      { "strand.title": { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: [...subStrandSearchConditions, ...strandSearchConditions],
      },
    });
  }

  pipeline.push({
    $count: "totalCount",
  });

  return pipeline;
};

module.exports = {
  buildSubStrandPipeline,
  buildSubStrandsPipeline,
  buildSubStrandCountPipeline,
};
