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

  // 3. Lookup (populate role)
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
      createdAt: { $toLong: "$createdAt" }, // Replace $toLong with $toMillis if needed
      updatedAt: { $toLong: "$updatedAt" },
      role: populate
        ? {
            roleCode: "$role.roleCode",
            roleName: "$role.roleName",
            roleDescription: "$role.roleDescription",
            rolePermissions: populate
              ? {
                  $map: {
                    input: "$role.rolePermissions",
                    as: "perm",
                    in: {
                      permissionCode: "$$perm.permissionCode",
                      permissionName: "$$perm.permissionName",
                      permissionDescription: "$$perm.permissionDescription",
                      createdAt: { $toLong: "$$perm.createdAt" },
                    },
                  },
                }
              : 0,
            createdAt: { $toLong: "$role.createdAt" },
            updatedAt: { $toLong: "$role.updatedAt" },
          }
        : 1,
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
  populate = false,
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
  const sortDirection = sortValue === "asc" ? 1 : -1;
  pipeline.push({ $sort: { [sortField]: sortDirection } });

  // 5. Pagination (skip if "all" is true)
  if (!all) {
    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedPage = parseInt(page, 10) || 1;
    const skip = (parsedPage - 1) * parsedLimit;

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parsedLimit });
  }

  // 6. Projection
  if (projection) {
    const baseProjection = {
      _id: 0,
      userCode: 1,
      username: 1,
      email: 1,
      userAllowDeletion: 1,
      createdAt: { $toLong: "$createdAt" }, // Use $toMillis if needed
      updatedAt: { $toLong: "$updatedAt" },
      role: populate
        ? {
            roleCode: "$role.roleCode",
            roleName: "$role.roleName",
            roleDescription: "$role.roleDescription",
            rolePermissions: populate
              ? {
                  $map: {
                    input: "$rolePermissions",
                    as: "perm",
                    in: {
                      permissionCode: "$$perm.permissionCode",
                      permissionName: "$$perm.permissionName",
                      permissionDescription: "$$perm.permissionDescription",
                      createdAt: { $toLong: "$$perm.createdAt" },
                    },
                  },
                }
              : 0,
            createdAt: { $toLong: "$role.createdAt" },
            updatedAt: { $toLong: "$role.updatedAt" },
          }
        : 1,
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildUserCountPipeline = ({ keyword, query = {}, populate }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
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

  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = {
  buildUserPipeline,
  buildUsersPipeline,
  buildUserCountPipeline,
};
