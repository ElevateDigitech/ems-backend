const buildCityPipeline = ({
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

  // 2. Lookup (populate state and country)
  if (populate) {
    pipeline.push(
      {
        $lookup: {
          from: "states",
          localField: "state",
          foreignField: "_id",
          as: "state",
        },
      },
      {
        $unwind: {
          path: "$state",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "country",
        },
      },
      {
        $unwind: {
          path: "$country",
          preserveNullAndEmptyArrays: true,
        },
      }
    );
  }

  // 3. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex for "LIKE"

    const searchConditions = [
      { cityCode: { $regex: keywordRegex } },
      { name: { $regex: keywordRegex } },
      { "state.name": { $regex: keywordRegex } },
      { "country.name": { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: searchConditions,
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

  // 6. Projection
  if (projection) {
    const baseProjection = {
      cityCode: 1,
      name: 1,
      createdAt: 1,
      updatedAt: 1,
      state: 1,
      country: 1,
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildCityCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const searchConditions = [
      { cityCode: { $regex: keywordRegex } },
      { name: { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: searchConditions,
      },
    });
  }

  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = { buildCityPipeline, buildCityCountPipeline };
