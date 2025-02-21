const buildCountryPipeline = ({ query = {}, projection = false }) => {
  const pipeline = [];

  // 1. Apply exact match filters if any fields are provided in the query object
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Limit the result to only 1 document
  pipeline.push({ $limit: 1 });

  // 3. Apply projection if requested
  if (projection) {
    const baseProjection = {
      _id: 0,
      countryCode: 1, // Include countryCode field
      name: 1, // Include name field
      iso2: 1, // Include iso2 field
      iso3: 1, // Include iso3 field
      createdAtEpochTimestamp: { $toLong: "$createdAt" }, // Convert createdAt field to long integer
      updatedAtEpochTimestamp: { $toLong: "$updatedAt" }, // Convert updatedAt field to long integer
    };
    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildCountriesPipeline = ({
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

    const searchConditions = [
      { countryCode: { $regex: keywordRegex } },
      { name: { $regex: keywordRegex } },
      { iso2: { $regex: keywordRegex } },
      { iso3: { $regex: keywordRegex } },
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
  if (projection) {
    const baseProjection = {
      _id: 0,
      countryCode: 1, // Include countryCode field
      name: 1, // Include name field
      iso2: 1, // Include iso2 field
      iso3: 1, // Include iso3 field
      createdAtEpochTimestamp: { $toLong: "$createdAt" }, // Convert createdAt field to long integer
      updatedAtEpochTimestamp: { $toLong: "$updatedAt" }, // Convert updatedAt field to long integer
    };
    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildCountryCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { countryCode: { $regex: keywordRegex } },
          { name: { $regex: keywordRegex } },
          { iso2: { $regex: keywordRegex } },
          { iso3: { $regex: keywordRegex } },
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
  buildCountryPipeline,
  buildCountriesPipeline,
  buildCountryCountPipeline,
};
