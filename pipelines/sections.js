const buildSectionPipeline = ({
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

    const sectionSearchConditions = [
      { sectionCode: { $regex: keywordRegex } },
      { name: { $regex: keywordRegex } },
    ];

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
      sectionCode: 1,
      name: 1,
      createdAt: 1,
      updatedAt: 1,
      class: populate
        ? {
            classCode: "$class.classCode",
            name: "$class.name",
            createdAt: "$class.createdAt",
          }
        : "$$REMOVE",
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildSectionCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { sectionCode: { $regex: keywordRegex } },
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
  buildSectionPipeline,
  buildSectionCountPipeline,
};
