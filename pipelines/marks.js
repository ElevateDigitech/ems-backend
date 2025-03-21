const buildMarkPipeline = ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = [];

  // Step 1: Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // Step 2: Limit to 1 document
  pipeline.push({ $limit: 1 });

  // Step 3: Lookup (populate related collections)
  if (populate) {
    pipeline.push(
      {
        $lookup: {
          from: "questionpapers",
          localField: "questionPaper",
          foreignField: "_id",
          as: "questionPaper",
        },
      },
      { $unwind: { path: "$questionPaper", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "questions",
          localField: "questionPaper.questions.question",
          foreignField: "_id",
          as: "questionDetails",
        },
      },
      {
        $lookup: {
          from: "exams",
          localField: "questionPaper.exam",
          foreignField: "_id",
          as: "questionPaperExam",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "questionPaper.subject",
          foreignField: "_id",
          as: "questionPaperSubject",
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "questionPaper.section",
          foreignField: "_id",
          as: "questionPaperSection",
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "questionPaper.section.class",
          foreignField: "_id",
          as: "questionPaperSectionClass",
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
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          "questionPaper.exam": {
            examCode: { $arrayElemAt: ["$questionPaperExam.examCode", 0] },
            title: { $arrayElemAt: ["$questionPaperExam.title", 0] },
            date: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.date", 0] },
              },
            },
            createdAt: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.createdAt", 0] },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.updatedAt", 0] },
              },
            },
          },
          "questionPaper.subject": {
            subjectCode: {
              $arrayElemAt: ["$questionPaperSubject.subjectCode", 0],
            },
            name: { $arrayElemAt: ["$questionPaperSubject.name", 0] },
            createdAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSubject.createdAt", 0],
                },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSubject.updatedAt", 0],
                },
              },
            },
          },
          "questionPaper.section": {
            sectionCode: {
              $arrayElemAt: ["$questionPaperSection.sectionCode", 0],
            },
            name: { $arrayElemAt: ["$questionPaperSection.name", 0] },
            createdAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSection.createdAt", 0],
                },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSection.updatedAt", 0],
                },
              },
            },
          },
          "questionPaper.questions": {
            $map: {
              input: "$questionPaper.questions",
              as: "q",
              in: {
                questionNumber: "$$q.questionNumber",
                topicOfFocus: "$$q.topicOfFocus",
                question: {
                  $let: {
                    vars: {
                      questionDetail: {
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
                    in: {
                      questionCode: "$$questionDetail.questionCode",
                      level: "$$questionDetail.level",
                      total: "$$questionDetail.total",
                      createdAt: "$$questionDetail.createdAt",
                      updatedAt: "$$questionDetail.updatedAt",
                    },
                  },
                },
              },
            },
          },
        },
      }
    );
  }

  // Step 4: Projection
  if (projection) {
    pipeline.push({
      $project: {
        _id: 0,
        markCode: 1,
        marksPerQuestion: 1,
        markEarned: 1,
        markTotal: 1,
        "questionPaper.questionPaperCode": 1,
        "questionPaper.title": 1,
        "questionPaper.exam": 1,
        "questionPaper.examDate": { $toLong: "$questionPaper.examDate" },
        "questionPaper.submissionDate": {
          $toLong: "$questionPaper.submissionDate",
        },
        "questionPaper.subject": 1,
        "questionPaper.section": 1,
        "questionPaper.questions": 1,
        "exam.examCode": 1,
        "exam.title": 1,
        "student.studentCode": 1,
        "student.name": 1,
        "student.rollNumber": 1,
        "subject.subjectCode": 1,
        "subject.name": 1,
        createdAt: { $toLong: "$createdAt" },
        updatedAt: { $toLong: "$updatedAt" },
      },
    });
  }

  return pipeline;
};

module.exports = { buildMarkPipeline };

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

  // Step 1: Match exact filters
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // Step 2: Populate related data
  if (populate) {
    pipeline.push(
      {
        $lookup: {
          from: "questionpapers",
          localField: "questionPaper",
          foreignField: "_id",
          as: "questionPaper",
        },
      },
      { $unwind: { path: "$questionPaper", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "questions",
          localField: "questionPaper.questions.question",
          foreignField: "_id",
          as: "questionDetails",
        },
      },
      {
        $lookup: {
          from: "exams",
          localField: "questionPaper.exam",
          foreignField: "_id",
          as: "questionPaperExam",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "questionPaper.subject",
          foreignField: "_id",
          as: "questionPaperSubject",
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "questionPaper.section",
          foreignField: "_id",
          as: "questionPaperSection",
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "questionPaper.section.class",
          foreignField: "_id",
          as: "questionPaperSectionClass",
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
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          "questionPaper.exam": {
            examCode: { $arrayElemAt: ["$questionPaperExam.examCode", 0] },
            title: { $arrayElemAt: ["$questionPaperExam.title", 0] },
            date: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.date", 0] },
              },
            },
            createdAt: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.createdAt", 0] },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.updatedAt", 0] },
              },
            },
          },
          "questionPaper.subject": {
            subjectCode: {
              $arrayElemAt: ["$questionPaperSubject.subjectCode", 0],
            },
            name: { $arrayElemAt: ["$questionPaperSubject.name", 0] },
            createdAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSubject.createdAt", 0],
                },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSubject.updatedAt", 0],
                },
              },
            },
          },
          "questionPaper.section": {
            sectionCode: {
              $arrayElemAt: ["$questionPaperSection.sectionCode", 0],
            },
            name: { $arrayElemAt: ["$questionPaperSection.name", 0] },
            createdAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSection.createdAt", 0],
                },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSection.updatedAt", 0],
                },
              },
            },
          },
          "questionPaper.questions": {
            $map: {
              input: "$questionPaper.questions",
              as: "q",
              in: {
                questionNumber: "$$q.questionNumber",
                topicOfFocus: "$$q.topicOfFocus",
                question: {
                  $let: {
                    vars: {
                      questionDetail: {
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
                    in: {
                      questionCode: "$$questionDetail.questionCode",
                      level: "$$questionDetail.level",
                      total: "$$questionDetail.total",
                      createdAt: "$$questionDetail.createdAt",
                      updatedAt: "$$questionDetail.updatedAt",
                    },
                  },
                },
              },
            },
          },
        },
      }
    );
  }

  // Step 3: Keyword Search (LIKE Match on All Fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

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

  // Step 4: Sorting
  pipeline.push({
    $sort: { [sortField]: sortValue === "asc" ? 1 : -1 },
  });

  // Step 5: Pagination (skip if "all" is true)
  if (!all) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });
  }

  // Step 6: Projection
  if (projection) {
    pipeline.push({
      $project: {
        _id: 0,
        markCode: 1,
        marksPerQuestion: 1,
        markEarned: 1,
        markTotal: 1,
        "questionPaper.questionPaperCode": 1,
        "questionPaper.title": 1,
        "questionPaper.exam": 1,
        "questionPaper.examDate": { $toLong: "$questionPaper.examDate" },
        "questionPaper.submissionDate": {
          $toLong: "$questionPaper.submissionDate",
        },
        "questionPaper.subject": 1,
        "questionPaper.section": 1,
        "questionPaper.questions": 1,
        "exam.examCode": 1,
        "exam.title": 1,
        "student.studentCode": 1,
        "student.name": 1,
        "student.rollNumber": 1,
        "subject.subjectCode": 1,
        "subject.name": 1,
        createdAt: { $toLong: "$createdAt" },
        updatedAt: { $toLong: "$updatedAt" },
      },
    });
  }

  return pipeline;
};

const buildMarkCountPipeline = ({ keyword, query = {}, populate = false }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (populate) {
    pipeline.push(
      {
        $lookup: {
          from: "questionpapers",
          localField: "questionPaper",
          foreignField: "_id",
          as: "questionPaper",
        },
      },
      { $unwind: { path: "$questionPaper", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "questions",
          localField: "questionPaper.questions.question",
          foreignField: "_id",
          as: "questionDetails",
        },
      },
      {
        $lookup: {
          from: "exams",
          localField: "questionPaper.exam",
          foreignField: "_id",
          as: "questionPaperExam",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "questionPaper.subject",
          foreignField: "_id",
          as: "questionPaperSubject",
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "questionPaper.section",
          foreignField: "_id",
          as: "questionPaperSection",
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "questionPaper.section.class",
          foreignField: "_id",
          as: "questionPaperSectionClass",
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
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          "questionPaper.exam": {
            examCode: { $arrayElemAt: ["$questionPaperExam.examCode", 0] },
            title: { $arrayElemAt: ["$questionPaperExam.title", 0] },
            date: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.date", 0] },
              },
            },
            createdAt: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.createdAt", 0] },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: { $arrayElemAt: ["$questionPaperExam.updatedAt", 0] },
              },
            },
          },
          "questionPaper.subject": {
            subjectCode: {
              $arrayElemAt: ["$questionPaperSubject.subjectCode", 0],
            },
            name: { $arrayElemAt: ["$questionPaperSubject.name", 0] },
            createdAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSubject.createdAt", 0],
                },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSubject.updatedAt", 0],
                },
              },
            },
          },
          "questionPaper.section": {
            sectionCode: {
              $arrayElemAt: ["$questionPaperSection.sectionCode", 0],
            },
            name: { $arrayElemAt: ["$questionPaperSection.name", 0] },
            createdAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSection.createdAt", 0],
                },
              },
            },
            updatedAt: {
              $toLong: {
                $toDate: {
                  $arrayElemAt: ["$questionPaperSection.updatedAt", 0],
                },
              },
            },
          },
          "questionPaper.questions": {
            $map: {
              input: "$questionPaper.questions",
              as: "q",
              in: {
                questionNumber: "$$q.questionNumber",
                topicOfFocus: "$$q.topicOfFocus",
                question: {
                  $let: {
                    vars: {
                      questionDetail: {
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
                    in: {
                      questionCode: "$$questionDetail.questionCode",
                      level: "$$questionDetail.level",
                      total: "$$questionDetail.total",
                      createdAt: "$$questionDetail.createdAt",
                      updatedAt: "$$questionDetail.updatedAt",
                    },
                  },
                },
              },
            },
          },
        },
      }
    );
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

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

  pipeline.push({
    $count: "totalCount",
  });

  return pipeline;
};

module.exports = {
  buildMarkPipeline,
  buildMarksPipeline,
  buildMarkCountPipeline,
};
