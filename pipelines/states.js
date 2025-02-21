const buildStatePipeline = ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = [];

  // 1. Apply exact match filters if any fields are provided in the query object
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Limit the result to only 1 document
  pipeline.push({ $limit: 1 });

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

  // 3. Apply projection if requested
  if (projection) {
    const baseProjection = {
      _id: 0,
      stateCode: 1,
      name: 1,
      iso: 1,
      country: populate
        ? {
            countryCode: "$country.countryCode",
            name: "$country.name",
            iso2: "$country.iso2",
            iso3: "$country.iso3",
            createdAtEpochTimestamp: { $toLong: "$country.createdAt" },
            updatedAtEpochTimestamp: { $toLong: "$country.updatedAt" },
          }
        : 1,
      createdAtEpochTimestamp: { $toLong: "$createdAt" }, // Convert createdAt field to long integer
      updatedAtEpochTimestamp: { $toLong: "$updatedAt" }, // Convert updatedAt field to long integer
    };
    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildStatesPipeline = ({
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
      { name: { $regex: keywordRegex } },
      { iso: { $regex: keywordRegex } },
    ];

    const countrySearchConditions = populate
      ? [{ "country.name": { $regex: keywordRegex } }]
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

  // 3. Apply projection if requested
  if (projection) {
    const baseProjection = {
      _id: 0,
      stateCode: 1,
      name: 1,
      iso: 1,
      country: populate
        ? {
            countryCode: "$country.countryCode",
            name: "$country.name",
            iso2: "$country.iso2",
            iso3: "$country.iso3",
            createdAtEpochTimestamp: { $toLong: "$country.createdAt" },
            updatedAtEpochTimestamp: { $toLong: "$country.updatedAt" },
          }
        : 1,
      createdAtEpochTimestamp: { $toLong: "$createdAt" }, // Convert createdAt field to long integer
      updatedAtEpochTimestamp: { $toLong: "$updatedAt" }, // Convert updatedAt field to long integer
    };
    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildStateCountPipeline = ({ keyword, query = {}, populate }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

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

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const stateSearchConditions = [
      { name: { $regex: keywordRegex } },
      { iso: { $regex: keywordRegex } },
    ];

    const countrySearchConditions = populate
      ? [{ "country.name": { $regex: keywordRegex } }]
      : [];

    pipeline.push({
      $match: {
        $or: [...stateSearchConditions, ...countrySearchConditions],
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
  buildStatesPipeline,
  buildStateCountPipeline,
};
