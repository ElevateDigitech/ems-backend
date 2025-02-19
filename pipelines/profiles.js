const buildProfilePipeline = ({
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

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (populate) {
    pipeline.push(
      {
        $lookup: {
          from: "cities",
          localField: "address.city",
          foreignField: "_id",
          as: "address.city",
        },
      },
      { $unwind: { path: "$address.city", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "states",
          localField: "address.state",
          foreignField: "_id",
          as: "address.state",
        },
      },
      { $unwind: { path: "$address.state", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "countries",
          localField: "address.country",
          foreignField: "_id",
          as: "address.country",
        },
      },
      {
        $unwind: { path: "$address.country", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "genders",
          localField: "gender",
          foreignField: "_id",
          as: "gender",
        },
      },
      { $unwind: { path: "$gender", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }
    );
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { profileCode: { $regex: keywordRegex } },
          { firstName: { $regex: keywordRegex } },
          { lastName: { $regex: keywordRegex } },
          { "address.city.name": { $regex: keywordRegex } },
          { "address.state.name": { $regex: keywordRegex } },
          { "address.country.name": { $regex: keywordRegex } },
          { "gender.genderName": { $regex: keywordRegex } },
          { "user.email": { $regex: keywordRegex } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { [sortField]: sortValue === "asc" ? 1 : -1 } });

  if (!all) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
  }

  if (projection && Object.keys(projection).length > 0) {
    pipeline.push({ $project: projection });
  }

  return pipeline;
};

const buildProfileCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { profileCode: { $regex: keywordRegex } },
          { firstName: { $regex: keywordRegex } },
          { lastName: { $regex: keywordRegex } },
        ],
      },
    });
  }

  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = { buildProfilePipeline, buildProfileCountPipeline };
