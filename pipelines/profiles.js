const buildProfilePipeline = ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = [];

  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  pipeline.push({ $limit: 1 });

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
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "roles",
          localField: "user.role",
          foreignField: "_id",
          as: "user.role",
        },
      },
      {
        $unwind: { path: "$user.role", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "user.role.rolePermissions",
          foreignField: "_id",
          as: "user.role.rolePermissions",
        },
      }
    );
  }

  if (projection) {
    const baseProjection = {
      _id: 0,
      profileCode: 1,
      firstName: 1,
      lastName: 1,
      profilePicture: {
        url: 1,
        filename: 1,
        extension: 1,
      },
      dob: { $toLong: "$dob" },
      gender: populate
        ? {
            genderCode: "$gender.genderCode",
            genderName: "$gender.genderName",
            createdAt: { $toLong: "$gender.createdAt" },
            updatedAt: { $toLong: "$gender.updatedAt" },
          }
        : 1,
      phoneNumber: 1,
      address: {
        addressLineOne: 1,
        addressLineTwo: 1,
        city: populate
          ? {
              cityCode: "$address.city.cityCode",
              name: "$address.city.name",
              createdAt: { $toLong: "$address.city.createdAt" },
              updatedAt: { $toLong: "$address.city.updatedAt" },
            }
          : 1,
        state: populate
          ? {
              stateCode: "$address.state.stateCode",
              name: "$address.state.name",
              iso: "$address.state.iso",
              createdAt: { $toLong: "$address.state.createdAt" },
              updatedAt: { $toLong: "$address.state.updatedAt" },
            }
          : 1,
        country: populate
          ? {
              countryCode: "$address.country.countryCode",
              name: "$address.country.name",
              iso2: "$address.country.iso2",
              iso3: "$address.country.iso3",
              createdAt: {
                $toLong: "$address.country.createdAt",
              },
              updatedAt: {
                $toLong: "$address.country.updatedAt",
              },
            }
          : 1,
        postalCode: 1,
      },
      social: {
        linkedin: 1,
        twitter: 1,
        facebook: 1,
        instagram: 1,
        websitePortfolioUrl: 1,
      },
      notification: {
        email: 1,
        sms: 1,
        push: 1,
      },
      user: populate
        ? {
            userCode: "$user.userCode",
            username: "$user.username",
            email: "$user.email",
            userAllowDeletion: "$user.userAllowDeletion",
            role: {
              roleCode: "$user.role.roleCode",
              roleName: "$user.role.roleName",
              roleDescription: "$user.role.roleDescription",
              rolePermissions: populate
                ? {
                    $map: {
                      input: "$user.role.rolePermissions",
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
              createdAt: { $toLong: "$user.role.createdAt" },
              updatedAt: { $toLong: "$user.role.updatedAt" },
            },
            createdAt: { $toLong: "$user.createdAt" },
            updatedAt: { $toLong: "$user.updatedAt" },
          }
        : 1,
      createdAt: { $toLong: "$createdAt" },
      updatedAt: { $toLong: "$updatedAt" },
    };

    pipeline.push({ $project: baseProjection });

    // Add thumbnail transformation
    pipeline.push({
      $addFields: {
        "profilePicture.thumbnail": {
          $replaceOne: {
            input: "$profilePicture.url",
            find: "/upload",
            replacement: "/upload/w_200",
          },
        },
      },
    });
  }

  return pipeline;
};

const buildProfilesPipeline = ({
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
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "roles",
          localField: "user.role",
          foreignField: "_id",
          as: "user.role",
        },
      },
      {
        $unwind: { path: "$user.role", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "user.role.rolePermissions",
          foreignField: "_id",
          as: "user.role.rolePermissions",
        },
      }
    );
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { firstName: { $regex: keywordRegex } },
          { lastName: { $regex: keywordRegex } },
          { phoneNumber: { $regex: keywordRegex } },
          { "address.addressLineOne": { $regex: keywordRegex } },
          { "address.addressLineTwo": { $regex: keywordRegex } },
          { "address.city.name": { $regex: keywordRegex } },
          { "address.state.name": { $regex: keywordRegex } },
          { "address.country.name": { $regex: keywordRegex } },
          { "address.postalCode": { $regex: keywordRegex } },
          { "gender.genderName": { $regex: keywordRegex } },
          { "user.username": { $regex: keywordRegex } },
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

  if (projection) {
    const baseProjection = {
      _id: 0,
      profileCode: 1,
      firstName: 1,
      lastName: 1,
      profilePicture: {
        url: 1,
        filename: 1,
        extension: 1,
      },
      dob: { $toLong: "$dob" },
      gender: populate
        ? {
            genderCode: "$gender.genderCode",
            genderName: "$gender.genderName",
            createdAt: { $toLong: "$gender.createdAt" },
            updatedAt: { $toLong: "$gender.updatedAt" },
          }
        : 1,
      phoneNumber: 1,
      address: {
        addressLineOne: 1,
        addressLineTwo: 1,
        city: populate
          ? {
              cityCode: "$address.city.cityCode",
              name: "$address.city.name",
              createdAt: { $toLong: "$address.city.createdAt" },
              updatedAt: { $toLong: "$address.city.updatedAt" },
            }
          : 1,
        state: populate
          ? {
              stateCode: "$address.state.stateCode",
              name: "$address.state.name",
              iso: "$address.state.iso",
              createdAt: { $toLong: "$address.state.createdAt" },
              updatedAt: { $toLong: "$address.state.updatedAt" },
            }
          : 1,
        country: populate
          ? {
              countryCode: "$address.country.countryCode",
              name: "$address.country.name",
              iso2: "$address.country.iso2",
              iso3: "$address.country.iso3",
              createdAt: {
                $toLong: "$address.country.createdAt",
              },
              updatedAt: {
                $toLong: "$address.country.updatedAt",
              },
            }
          : 1,
        postalCode: 1,
      },
      social: {
        linkedin: 1,
        twitter: 1,
        facebook: 1,
        instagram: 1,
        websitePortfolioUrl: 1,
      },
      notification: {
        email: 1,
        sms: 1,
        push: 1,
      },
      user: populate
        ? {
            userCode: "$user.userCode",
            username: "$user.username",
            email: "$user.email",
            userAllowDeletion: "$user.userAllowDeletion",
            role: {
              roleCode: "$user.role.roleCode",
              roleName: "$user.role.roleName",
              roleDescription: "$user.role.roleDescription",
              rolePermissions: populate
                ? {
                    $map: {
                      input: "$user.role.rolePermissions",
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
              createdAt: { $toLong: "$user.role.createdAt" },
              updatedAt: { $toLong: "$user.role.updatedAt" },
            },
            createdAt: { $toLong: "$user.createdAt" },
            updatedAt: { $toLong: "$user.updatedAt" },
          }
        : 1,
      createdAt: { $toLong: "$createdAt" },
      updatedAt: { $toLong: "$updatedAt" },
    };

    pipeline.push({ $project: baseProjection });

    // Add thumbnail transformation
    pipeline.push({
      $addFields: {
        "profilePicture.thumbnail": {
          $replaceOne: {
            input: "$profilePicture.url",
            find: "/upload",
            replacement: "/upload/w_200",
          },
        },
      },
    });
  }

  return pipeline;
};

const buildProfileCountPipeline = ({
  keyword,
  query = {},
  populate = false,
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
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "roles",
          localField: "user.role",
          foreignField: "_id",
          as: "user.role",
        },
      },
      {
        $unwind: { path: "$user.role", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "user.role.rolePermissions",
          foreignField: "_id",
          as: "user.role.rolePermissions",
        },
      }
    );
  }

  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    pipeline.push({
      $match: {
        $or: [
          { firstName: { $regex: keywordRegex } },
          { lastName: { $regex: keywordRegex } },
          { phoneNumber: { $regex: keywordRegex } },
          { "address.addressLineOne": { $regex: keywordRegex } },
          { "address.addressLineTwo": { $regex: keywordRegex } },
          { "address.city.name": { $regex: keywordRegex } },
          { "address.state.name": { $regex: keywordRegex } },
          { "address.country.name": { $regex: keywordRegex } },
          { "address.postalCode": { $regex: keywordRegex } },
          { "gender.genderName": { $regex: keywordRegex } },
          { "user.username": { $regex: keywordRegex } },
        ],
      },
    });
  }

  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = {
  buildProfilePipeline,
  buildProfilesPipeline,
  buildProfileCountPipeline,
};
