const buildRolePipeline = ({
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
    pipeline.push({
      $lookup: {
        from: "permissions",
        localField: "rolePermissions",
        foreignField: "_id",
        as: "rolePermissions",
      },
    });
  }

  // 4. Projection
  if (projection) {
    const baseProjection = {
      _id: 0,
      roleCode: 1,
      roleName: 1,
      roleDescription: 1,
      roleAllowDeletion: 1,
      createdAtEpochTimestamp: { $toLong: "$createdAt" },
      updatedAtEpochTimestamp: { $toLong: "$updatedAt" },
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
        : 1,
    };

    pipeline.push({ $project: baseProjection });
  }

  // 5. Limit the results to 1 document
  pipeline.push({ $limit: 1 });

  return pipeline;
};

const buildRolesPipeline = ({
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

  // 2. Lookup (populate permissions)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "permissions",
        localField: "rolePermissions",
        foreignField: "_id",
        as: "rolePermissions",
      },
    });
  }

  // 3. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex for "LIKE"
    const searchConditions = [
      { roleName: { $regex: keywordRegex } },
      { roleDescription: { $regex: keywordRegex } },
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
      _id: 0,
      roleCode: 1,
      roleName: 1,
      roleDescription: 1,
      roleAllowDeletion: 1,
      createdAtEpochTimestamp: { $toLong: "$createdAt" },
      updatedAtEpochTimestamp: { $toLong: "$updatedAt" },
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
        : 1,
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildRoleCountPipeline = ({ keyword, query = {}, populate = false }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Lookup (populate permissions)
  if (populate) {
    pipeline.push(
      {
        $lookup: {
          from: "permissions",
          localField: "rolePermissions",
          foreignField: "_id",
          as: "rolePermissions",
        },
      },
      {
        $unwind: {
          path: "$rolePermissions",
          preserveNullAndEmptyArrays: true,
        },
      }
    );
  }

  // 3. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex for "LIKE"
    const searchConditions = [
      { roleName: { $regex: keywordRegex } },
      { roleDescription: { $regex: keywordRegex } },
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

module.exports = {
  buildRolePipeline,
  buildRolesPipeline,
  buildRoleCountPipeline,
};
