const buildMarkPipeline = ({
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

  // 2. Lookup (populate exam, student, and subject)
  if (populate) {
    pipeline.push(
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } }
    );
  }

  // 3. Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex for "LIKE"

    const markSearchConditions = [
      { markCode: { $regex: keywordRegex } },
      { markEarned: { $regex: keywordRegex } },
      { markTotal: { $regex: keywordRegex } },
    ];

    const populateSearchConditions = populate
      ? [
          { "exam.examCode": { $regex: keywordRegex } },
          { "exam.title": { $regex: keywordRegex } },
          { "student.name": { $regex: keywordRegex } },
          { "student.rollNumber": { $regex: keywordRegex } },
          { "subject.name": { $regex: keywordRegex } },
          { "subject.subjectCode": { $regex: keywordRegex } },
        ]
      : [];

    pipeline.push({
      $match: {
        $or: [...markSearchConditions, ...populateSearchConditions],
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
      markCode: 1,
      markEarned: 1,
      markTotal: 1,
      createdAt: 1,
      updatedAt: 1,
      exam: populate ? { examCode: 1, title: 1 } : "$$REMOVE",
      student: populate ? { name: 1, rollNumber: 1 } : "$$REMOVE",
      subject: populate ? { name: 1, subjectCode: 1 } : "$$REMOVE",
    };

    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

const buildMarkCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { markCode: { $regex: keywordRegex } },
          { markEarned: { $regex: keywordRegex } },
          { markTotal: { $regex: keywordRegex } },
        ],
      },
    });
  }

  pipeline.push({
    $count: "totalCount",
  });

  return pipeline;
};

module.exports = { buildMarkPipeline, buildMarkCountPipeline };
