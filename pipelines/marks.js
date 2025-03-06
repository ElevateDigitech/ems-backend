const buildMarksPipeline = ({
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

  // 2. Lookup (populate exam, student, and subject)
  if (populate) {
    pipeline.push(
      {
        $lookup: {
          from: "questionPapers",
          localField: "questionPaper",
          foreignField: "_id",
          as: "questionPaper",
        },
      },
      { $unwind: { path: "$questionPaper", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "exams",
          localField: "questionPaper.exam",
          foreignField: "_id",
          as: "questionPaper.exam",
        },
      },
      {
        $unwind: {
          path: "$questionPaper.exam",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "questionPaper.subject",
          foreignField: "_id",
          as: "questionPaper.subject",
        },
      },
      {
        $unwind: {
          path: "$questionPaper.subject",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "questionPaper.section",
          foreignField: "_id",
          as: "questionPaper.section",
        },
      },
      {
        $unwind: {
          path: "$questionPaper.section",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "questionPaper.questions.question",
          foreignField: "_id",
          as: "questionPaper.questionDetails",
        },
      },
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
          from: "sections",
          localField: "student.section",
          foreignField: "_id",
          as: "student.section",
        },
      },
      {
        $unwind: { path: "$student.section", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          questionPaper: {
            exam: {
              examCode: "$questionPaper.exam.examCode",
              title: "$questionPaper.exam.title",
              date: { $toLong: "$questionPaper.exam.date" },
              createdAt: { $toLong: "$questionPaper.exam.createdAt" },
              updatedAt: { $toLong: "$questionPaper.exam.updatedAt" },
            },
            subject: {
              subjectCode: "$questionPaper.subject.subjectCode",
              name: "$questionPaper.subject.name",
              createdAt: { $toLong: "$questionPaper.subject.createdAt" },
              updatedAt: { $toLong: "$questionPaper.subject.updatedAt" },
            },
            section: {
              sectionCode: "$questionPaper.section.sectionCode",
              name: "$questionPaper.section.name",
              createdAt: { $toLong: "$questionPaper.section.createdAt" },
              updatedAt: { $toLong: "$questionPaper.section.updatedAt" },
            },
            questions: {
              $map: {
                input: "$questionPaper.questions",
                as: "q",
                in: {
                  questionNumber: "$$q.questionNumber",
                  question: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$questionPaper.questionDetails",
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
        },
      }
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
          { "exam.title": { $regex: keywordRegex } },
          { "student.name": { $regex: keywordRegex } },
          { "student.rollNumber": { $regex: keywordRegex } },
          { "subject.name": { $regex: keywordRegex } },
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
      _id: 0,
      markCode: 1,
      questionPaper: 1,
      markEarned: 1,
      markTotal: 1,
      createdAt: 1,
      updatedAt: 1,
      exam: populate
        ? {
            examCode: "$exam.examCode",
            title: "$exam.title",
            date: { $toLong: "$exam.date" },
            createdAt: { $toLong: "$exam.createdAt" },
            updatedAt: { $toLong: "$exam.updatedAt" },
          }
        : 1,
      student: populate
        ? {
            studentCode: "$student.studentCode",
            name: "$student.examnameCode",
            rollNumber: "$student.rollNumber",
            section: {
              sectionCode: "$student.section.sectionCode",
              name: "$student.section.name",
              class: {
                classCode: "$student.section.class.classCode",
                name: "$student.section.class.name",
                createdAt: { $toLong: "$student.section.class.createdAt" },
                updatedAt: { $toLong: "$student.section.class.updatedAt" },
              },
              createdAt: { $toLong: "$student.section.createdAt" },
              updatedAt: { $toLong: "$student.section.updatedAt" },
            },
            createdAt: { $toLong: "$student.createdAt" },
            updatedAt: { $toLong: "$student.updatedAt" },
          }
        : 1,
      subject: populate
        ? {
            subjectCode: "$subject.studentCode",
            name: "$subject.studentCode",
            createdAt: { $toLong: "$subject.createdAt" },
            updatedAt: { $toLong: "$subject.updatedAt" },
          }
        : 1,
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

module.exports = { buildMarksPipeline, buildMarkCountPipeline };
