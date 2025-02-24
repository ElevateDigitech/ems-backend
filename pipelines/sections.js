const buildSectionPipeline = ({
  query = {},
  projection = false,
  populate = true,
}) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Limit the result to only 1 document
  pipeline.push({ $limit: 1 });

  // 2. Lookup (populate class)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "classes",
        localField: "class",
        foreignField: "_id",
        as: "class",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$class",
        preserveNullAndEmptyArrays: true,
      },
    });
  }

  // 6. Projection (Include-Only Fields)
  if (projection) {
    const baseProjection = {
      _id: 0,
      sectionCode: 1,
      name: 1,
      createdAt: 1,
      updatedAt: 1,
      class: populate
        ? {
            classCode: "$class.classCode",
            name: "$class.name",
            createdAtEpochTimestamp: { $toLong: "$country.createdAt" },
            updatedAtEpochTimestamp: { $toLong: "$country.updatedAt" },
          }
        : 1,
      createdAtEpochTimestamp: { $toLong: "$country.createdAt" },
      updatedAtEpochTimestamp: { $toLong: "$country.updatedAt" },
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildSectionsPipeline = ({
  keyword,
  query = {},
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  populate = true,
  all = false,
}) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Lookup (populate class)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "classes",
        localField: "class",
        foreignField: "_id",
        as: "class",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$class",
        preserveNullAndEmptyArrays: true,
      },
    });
  }

  // 3. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const sectionSearchConditions = [{ name: { $regex: keywordRegex } }];

    const classSearchConditions = populate
      ? [{ "class.name": { $regex: keywordRegex } }]
      : [];

    pipeline.push({
      $match: {
        $or: [...sectionSearchConditions, ...classSearchConditions],
      },
    });
  }

  // 4. Sorting
  pipeline.push({
    $sort: { [sortField]: sortValue === "asc" ? 1 : -1 },
  });

  // 5. Pagination (skip if "all" is true)
  if (!all) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
  }

  // 6. Projection (Include-Only Fields)
  if (projection) {
    const baseProjection = {
      _id: 0,
      sectionCode: 1,
      name: 1,
      createdAt: 1,
      updatedAt: 1,
      class: populate
        ? {
            classCode: "$class.classCode",
            name: "$class.name",
            createdAtEpochTimestamp: { $toLong: "$country.createdAt" },
            updatedAtEpochTimestamp: { $toLong: "$country.updatedAt" },
          }
        : 1,
      createdAtEpochTimestamp: { $toLong: "$country.createdAt" },
      updatedAtEpochTimestamp: { $toLong: "$country.updatedAt" },
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildSectionCountPipeline = ({
  keyword,
  query = {},
  populate = false,
}) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Lookup (populate class)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "classes",
        localField: "class",
        foreignField: "_id",
        as: "class",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$class",
        preserveNullAndEmptyArrays: true,
      },
    });
  }

  // 3. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const sectionSearchConditions = [{ name: { $regex: keywordRegex } }];

    const classSearchConditions = populate
      ? [{ "class.name": { $regex: keywordRegex } }]
      : [];

    pipeline.push({
      $match: {
        $or: [...sectionSearchConditions, ...classSearchConditions],
      },
    });
  }

  pipeline.push({
    $count: "totalCount",
  });

  return pipeline;
};

module.exports = {
  buildSectionPipeline,
  buildSectionsPipeline,
  buildSectionCountPipeline,
};
