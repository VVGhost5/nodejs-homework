const Contact = require("./schemas/contact");

const getAll = async (userId) => {
  console.log(Contact);
  const results = await Contact.find({ owner: userId }).populate({
    path: "owner",
    select: "name email phone -_id",
  });
  console.log(`results ${results}`);
  return results;
};

const getById = async (id, userId) => {
  const result = await Contact.findOne({ _id: id, owner: userId }).populate({
    path: "owner",
    select: "name email phone -_id",
  });
  return result;
};

const create = async (body) => {
  const result = await Contact.create(body);
  return result;
};

const update = async (id, body, userId) => {
  const result = await Contact.findOneAndUpdate(
    { _id: id, owner: userId },
    { ...body },
    { new: true }
  );
  return result;
};

const remove = async (id, userId) => {
  const result = await Contact.findOneAndRemove({ _id: id, owner: userId });
  return result;
};

module.exports = {
  getAll,
  getById,
  remove,
  create,
  update,
};
