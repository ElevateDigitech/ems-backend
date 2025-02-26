const buildCityPipeline = ({
  query = {},
  projection = false,
  populate = false,
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

  // 4. Projection
  if (projection) {
    const baseProjection = {
      _id: 0,
      cityCode: 1,
      name: 1,
      createdAt: { $toLong: "$createdAt" },
      updatedAt: { $toLong: "$updatedAt" },
      state: populate
        ? {
            stateCode: "$state.stateCode",
            name: "$state.name",
            iso: "$state.iso",
            createdAt: { $toLong: "$state.createdAt" },
            updatedAt: { $toLong: "$state.updatedAt" },
          }
        : 1,
      country: populate
        ? {
            countryCode: "$country.countryCode",
            name: "$country.name",
            iso2: "$country.iso2",
            iso3: "$country.iso3",
            createdAt: { $toLong: "$country.createdAt" },
            updatedAt: { $toLong: "$country.updatedAt" },
          }
        : 1,
    };

    pipeline.push({ $project: baseProjection });
  }

  // 5. Limit the results to 1 document
  pipeline.push({ $limit: 1 });

  return pipeline;
};

const buildCitiesPipeline = ({
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
    const searchConditions = [{ name: { $regex: keywordRegex } }];
    if (populate) {
      searchConditions.push(
        ...[
          { "state.name": { $regex: keywordRegex } },
          { "country.name": { $regex: keywordRegex } },
        ]
      );
    }
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
      _id: 0,
      cityCode: 1,
      name: 1,
      createdAt: { $toLong: "$createdAt" },
      updatedAt: { $toLong: "$updatedAt" },
      state: populate
        ? {
            stateCode: "$state.stateCode",
            name: "$state.name",
            iso: "$state.iso",
            createdAt: { $toLong: "$state.createdAt" },
            updatedAt: { $toLong: "$state.updatedAt" },
          }
        : 1,
      country: populate
        ? {
            countryCode: "$country.countryCode",
            name: "$country.name",
            iso2: "$country.iso2",
            iso3: "$country.iso3",
            createdAt: { $toLong: "$country.createdAt" },
            updatedAt: { $toLong: "$country.updatedAt" },
          }
        : 1,
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildCityCountPipeline = ({ keyword, query = {}, populate = false }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

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
          localField: "state.country",
          foreignField: "_id",
          as: "country",
        },
      },
      {
        $unwind: {
          path: "$state.country",
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
    const searchConditions = [{ name: { $regex: keywordRegex } }];
    if (populate) {
      searchConditions.push(
        ...[
          { "state.name": { $regex: keywordRegex } },
          { "country.name": { $regex: keywordRegex } },
        ]
      );
    }
    pipeline.push({
      $match: {
        $or: searchConditions,
      },
    });
  }

  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = {
  buildCityPipeline,
  buildCitiesPipeline,
  buildCityCountPipeline,
};
