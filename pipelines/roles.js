const buildRolePipeline = ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = [];

  // 1. Match the query (usually filters like { permissionCode: 'SOME_CODE' })
  pipeline.push({ $match: query });

  // 2. Limit to 1 document
  pipeline.push({ $limit: 1 });

  // 2. Lookup (populate rolePermissions)
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

  // 4. Projection (Optional)
  if (projection) {
    pipeline.push({
      $project: {
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
      },
    });
  }

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
  populate = true,
  all = false,
}) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Lookup (populate rolePermissions)
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

    // Dynamic search conditions for role fields
    const roleSearchConditions = [
      { roleCode: { $regex: keywordRegex } },
      { roleName: { $regex: keywordRegex } },
      { roleDescription: { $regex: keywordRegex } },
    ];

    // Dynamic search conditions for permission fields (if populated)
    const permissionSearchConditions = populate
      ? [
          { "rolePermissions.permissionCode": { $regex: keywordRegex } },
          { "rolePermissions.permissionName": { $regex: keywordRegex } },
          { "rolePermissions.permissionDescription": { $regex: keywordRegex } },
        ]
      : [];

    pipeline.push({
      $match: {
        $or: [...roleSearchConditions, ...permissionSearchConditions],
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
    // 6. Projection (Include-Only Fields & Clean Up Permissions)
    pipeline.push({
      $project: {
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
      },
    });
  }

  return pipeline;
};

const buildRoleCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { roleCode: { $regex: keywordRegex } },
          { roleName: { $regex: keywordRegex } },
          { roleDescription: { $regex: keywordRegex } },
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
  buildRolePipeline,
  buildRolesPipeline,
  buildRoleCountPipeline,
};
