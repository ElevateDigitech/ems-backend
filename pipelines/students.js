const buildStudentPipeline = ({
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

  // 2. Lookup (populate section)
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "sections",
        localField: "section",
        foreignField: "_id",
        as: "section",
      },
    });
    pipeline.push({
      $unwind: { path: "$section", preserveNullAndEmptyArrays: true },
    });
  }

  // 3. Keyword Search
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const studentSearchConditions = [
      { studentCode: { $regex: keywordRegex } },
      { name: { $regex: keywordRegex } },
      { rollNumber: { $regex: keywordRegex } },
    ];

    const sectionSearchConditions = populate
      ? [
          { "section.name": { $regex: keywordRegex } },
          { "section.sectionCode": { $regex: keywordRegex } },
        ]
      : [];

    pipeline.push({
      $match: {
        $or: [...studentSearchConditions, ...sectionSearchConditions],
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
    // 6. Projection
    const baseProjection = {
      studentCode: 1,
      name: 1,
      rollNumber: 1,
      section: populate
        ? {
            sectionCode: 1,
            name: 1,
            class: 1,
          }
        : "$section",
      createdAt: 1,
      updatedAt: 1,
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildStudentCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { studentCode: { $regex: keywordRegex } },
          { name: { $regex: keywordRegex } },
          { rollNumber: { $regex: keywordRegex } },
        ],
      },
    });
  }

  pipeline.push({
    $count: "totalCount",
  });

  return pipeline;
};

module.exports = { buildStudentPipeline, buildStudentCountPipeline };
