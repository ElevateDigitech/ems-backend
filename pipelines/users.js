const buildUserPipeline = ({
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

  // 2. Lookup (populate role)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "role",
      },
    });
    pipeline.push({
      $unwind: { path: "$role", preserveNullAndEmptyArrays: true },
    });
  }

  // 3. Keyword Search
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const userSearchConditions = [
      { userCode: { $regex: keywordRegex } },
      { email: { $regex: keywordRegex } },
    ];

    const roleSearchConditions = populate
      ? [{ "role.roleName": { $regex: keywordRegex } }]
      : [];

    pipeline.push({
      $match: {
        $or: [...userSearchConditions, ...roleSearchConditions],
      },
    });
  }

  // 4. Sorting
  pipeline.push({ $sort: { [sortField]: sortValue === "asc" ? 1 : -1 } });

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
      userCode: 1,
      email: 1,
      userAllowDeletion: 1,
      createdAt: 1,
      updatedAt: 1,
      role: populate
        ? {
            roleCode: "$role.roleCode",
            roleName: "$role.roleName",
            roleDescription: "$role.roleDescription",
            createdAt: "$role.createdAt",
            updatedAt: "$role.updatedAt",
          }
        : "$$REMOVE",
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildUserCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    pipeline.push({
      $match: {
        $or: [
          { userCode: { $regex: keywordRegex } },
          { email: { $regex: keywordRegex } },
        ],
      },
    });
  }

  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = { buildUserPipeline, buildUserCountPipeline };
