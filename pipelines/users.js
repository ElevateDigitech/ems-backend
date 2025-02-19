const buildUserPipeline = ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = [];

  // 1. Match the query (usually filters like { permissionCode: 'SOME_CODE' })
  pipeline.push({ $match: query });

  // 2. Limit to 1 document
  pipeline.push({ $limit: 1 });

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

    pipeline.push({
      $lookup: {
        from: "permissions",
        localField: "role.rolePermissions",
        foreignField: "_id",
        as: "role.rolePermissions",
      },
    });
  }

  // 4. Projection (Optional)
  if (projection) {
    const baseProjection = {
      _id: 0,
      userCode: 1,
      username: 1,
      email: 1,
      userAllowDeletion: 1,
      createdAtEpochTimestamp: { $toLong: "$createdAt" },
      updatedAtEpochTimestamp: { $toLong: "$updatedAt" },
      role: populate
        ? {
            roleCode: "$role.roleCode",
            roleName: "$role.roleName",
            roleDescription: "$role.roleDescription",
            createdAtEpochTimestamp: { $toLong: "$rolecreatedAt" },
            updatedAtEpochTimestamp: { $toLong: "$role.updatedAt" },
          }
        : 1,
      rolePermissions: populate
        ? {
            $map: {
              input: "$rolePermissions",
              as: "perm",
              in: {
                permissionCode: "$$perm.permissionCode",
                permissionName: "$$perm.permissionName",
                permissionDescription: "$$perm.permissionDescription",
                createdAtEpochTimestamp: { $toLong: "$$perm.createdAt" },
              },
            },
          }
        : 0,
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildUsersPipeline = ({
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

    pipeline.push({
      $lookup: {
        from: "permissions",
        localField: "role.rolePermissions",
        foreignField: "_id",
        as: "rolePermissions",
      },
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
      username: 1,
      email: 1,
      userAllowDeletion: 1,
      createdAtEpochTimestamp: { $toLong: "$createdAt" },
      updatedAtEpochTimestamp: { $toLong: "$updatedAt" },
      role: populate
        ? {
            roleCode: "$role.roleCode",
            roleName: "$role.roleName",
            roleDescription: "$role.roleDescription",
            createdAtEpochTimestamp: { $toLong: "$rolecreatedAt" },
            updatedAtEpochTimestamp: { $toLong: "$role.updatedAt" },
          }
        : 1,
      rolePermissions: populate
        ? {
            $map: {
              input: "$rolePermissions",
              as: "perm",
              in: {
                permissionCode: "$$perm.permissionCode",
                permissionName: "$$perm.permissionName",
                permissionDescription: "$$perm.permissionDescription",
                createdAtEpochTimestamp: { $toLong: "$$perm.createdAt" },
              },
            },
          }
        : 0,
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

module.exports = {
  buildUserPipeline,
  buildUsersPipeline,
  buildUserCountPipeline,
};
