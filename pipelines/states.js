const buildStatePipeline = ({
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

  // 2. Lookup (populate country)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "countries",
        localField: "country",
        foreignField: "_id",
        as: "country",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$country",
        preserveNullAndEmptyArrays: true,
      },
    });
  }

  // 3. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const stateSearchConditions = [
      { stateCode: { $regex: keywordRegex } },
      { name: { $regex: keywordRegex } },
      { iso: { $regex: keywordRegex } },
    ];

    const countrySearchConditions = populate
      ? [
          { "country.name": { $regex: keywordRegex } },
          { "country.countryCode": { $regex: keywordRegex } },
          { "country.iso2": { $regex: keywordRegex } },
          { "country.iso3": { $regex: keywordRegex } },
        ]
      : [];

    pipeline.push({
      $match: {
        $or: [...stateSearchConditions, ...countrySearchConditions],
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

  if (projection) {
    // 6. Projection (Include-Only Fields)
    const baseProjection = {
      stateCode: 1,
      name: 1,
      iso: 1,
      createdAt: 1,
      updatedAt: 1,
      country: populate
        ? {
            countryCode: "$country.countryCode",
            name: "$country.name",
            iso2: "$country.iso2",
            iso3: "$country.iso3",
            createdAt: "$country.createdAt",
          }
        : "$$REMOVE",
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildStateCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    pipeline.push({
      $match: {
        $or: [
          { stateCode: { $regex: keywordRegex } },
          { name: { $regex: keywordRegex } },
          { iso: { $regex: keywordRegex } },
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
  buildStatePipeline,
  buildStateCountPipeline,
};
