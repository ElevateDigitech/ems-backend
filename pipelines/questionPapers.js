const buildQuestionPaperPipeline = ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = [];

  // 1. Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // Step 2: Limit to 1 document
  pipeline.push({ $limit: 1 });

  // Step 2. Lookup to populate questions
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "exams",
        localField: "exam",
        foreignField: "_id",
        as: "exam",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$exam",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "subjects",
        localField: "subject",
        foreignField: "_id",
        as: "subject",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$subject",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "sections",
        localField: "section",
        foreignField: "_id",
        as: "section",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$section",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "questions",
        localField: "questions.question",
        foreignField: "_id",
        as: "questionDetails",
      },
    });

    pipeline.push({
      $addFields: {
        exam: {
          examCode: "$exam.examCode",
          title: "$exam.title",
          date: { $toLong: "$exam.date" },
          createdAt: { $toLong: "$exam.createdAt" },
          updatedAt: { $toLong: "$exam.updatedAt" },
        },
        subject: {
          subjectCode: "$subject.subjectCode",
          name: "$subject.name",
          createdAt: { $toLong: "$subject.createdAt" },
          updatedAt: { $toLong: "$subject.updatedAt" },
        },
        section: {
          sectionCode: "$section.sectionCode",
          name: "$section.name",
          createdAt: { $toLong: "$section.createdAt" },
          updatedAt: { $toLong: "$section.updatedAt" },
        },
        questions: {
          $map: {
            input: "$questions",
            as: "q",
            in: {
              questionNumber: "$$q.questionNumber",
              strand: "$$q.strand",
              subStrand: "$$q.subStrand",
              question: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$questionDetails",
                      as: "qd",
                      cond: { $eq: ["$$qd._id", "$$q.question"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    });
  }

  // Step 5. Projection
  if (projection) {
    pipeline.push({
      $project: {
        _id: 0,
        questionPaperCode: 1,
        title: 1,
        section: 1,
        subject: 1,
        exam: 1,
        examDate: { $toLong: "$examDate" },
        submissionDate: { $toLong: "$submissionDate" },
        questions: 1,
        createdAt: { $toLong: "$createdAt" },
        updatedAt: { $toLong: "$updatedAt" },
      },
    });
  }

  return pipeline;
};

const buildQuestionPapersPipeline = ({
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

  // Step 2. Lookup to populate questions
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "exams",
        localField: "exam",
        foreignField: "_id",
        as: "exam",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$exam",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "subjects",
        localField: "subject",
        foreignField: "_id",
        as: "subject",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$subject",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "sections",
        localField: "section",
        foreignField: "_id",
        as: "section",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$section",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "questions",
        localField: "questions.question",
        foreignField: "_id",
        as: "questionDetails",
      },
    });

    pipeline.push({
      $addFields: {
        exam: {
          examCode: "$exam.examCode",
          title: "$exam.title",
          date: { $toLong: "$exam.date" },
          createdAt: { $toLong: "$exam.createdAt" },
          updatedAt: { $toLong: "$exam.updatedAt" },
        },
        subject: {
          subjectCode: "$subject.subjectCode",
          name: "$subject.name",
          createdAt: { $toLong: "$subject.createdAt" },
          updatedAt: { $toLong: "$subject.updatedAt" },
        },
        section: {
          sectionCode: "$section.sectionCode",
          name: "$section.name",
          createdAt: { $toLong: "$section.createdAt" },
          updatedAt: { $toLong: "$section.updatedAt" },
        },
        questions: {
          $map: {
            input: "$questions",
            as: "q",
            in: {
              questionNumber: "$$q.questionNumber",
              strand: "$$q.strand",
              subStrand: "$$q.subStrand",
              question: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$questionDetails",
                      as: "qd",
                      cond: { $eq: ["$$qd._id", "$$q.question"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    });
  }

  // 2. Keyword Search (LIKE Match on Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    const searchConditions = [
      { title: { $regex: keywordRegex } },
      { "exam.title": { $regex: keywordRegex } },
      { "subject.name": { $regex: keywordRegex } },
      { "section.name": { $regex: keywordRegex } },
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

  // Step 5. Projection
  if (projection) {
    pipeline.push({
      $project: {
        _id: 0,
        questionPaperCode: 1,
        title: 1,
        section: 1,
        subject: 1,
        exam: 1,
        examDate: { $toLong: "$examDate" },
        submissionDate: { $toLong: "$submissionDate" },
        questions: 1,
        createdAt: { $toLong: "$createdAt" },
        updatedAt: { $toLong: "$updatedAt" },
      },
    });
  }

  return pipeline;
};

const buildQuestionPaperCountPipeline = ({
  keyword,
  query = {},
  populate = false,
}) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // Step 2. Lookup to populate questions
  if (populate) {
    pipeline.push({
      $lookup: {
        from: "exams",
        localField: "exam",
        foreignField: "_id",
        as: "exam",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$exam",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "subjects",
        localField: "subject",
        foreignField: "_id",
        as: "subject",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$subject",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "sections",
        localField: "section",
        foreignField: "_id",
        as: "section",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$section",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "questions",
        localField: "questions.question",
        foreignField: "_id",
        as: "questionDetails",
      },
    });

    pipeline.push({
      $addFields: {
        exam: {
          examCode: "$exam.examCode",
          title: "$exam.title",
          date: { $toLong: "$exam.date" },
          createdAt: { $toLong: "$exam.createdAt" },
          updatedAt: { $toLong: "$exam.updatedAt" },
        },
        subject: {
          subjectCode: "$subject.subjectCode",
          name: "$subject.name",
          createdAt: { $toLong: "$subject.createdAt" },
          updatedAt: { $toLong: "$subject.updatedAt" },
        },
        section: {
          sectionCode: "$section.sectionCode",
          name: "$section.name",
          createdAt: { $toLong: "$section.createdAt" },
          updatedAt: { $toLong: "$section.updatedAt" },
        },
        questions: {
          $map: {
            input: "$questions",
            as: "q",
            in: {
              questionNumber: "$$q.questionNumber",
              strand: "$$q.strand",
              subStrand: "$$q.subStrand",
              question: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$questionDetails",
                      as: "qd",
                      cond: { $eq: ["$$qd._id", "$$q.question"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    });
  }

  // 2. Keyword Search (LIKE Match on Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    const searchConditions = [
      { title: { $regex: keywordRegex } },
      { "exam.title": { $regex: keywordRegex } },
      { "subject.name": { $regex: keywordRegex } },
      { "section.name": { $regex: keywordRegex } },
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
  buildQuestionPaperPipeline,
  buildQuestionPapersPipeline,
  buildQuestionPaperCountPipeline,
};
