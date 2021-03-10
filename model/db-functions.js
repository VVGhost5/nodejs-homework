const Contact = require("./schemas/contact");

const listContacts = async (userId) => {
  try {
    const results = await Contact.find({ owner: userId });
    return results;
  } catch (error) {
    return error;
  }
};

const getContactById = async (id, userId) => {
  try {
    const result = await Contact.findById(id, { owner: userId });
    return result;
  } catch (error) {
    return error;
  }
};

const removeContact = async (id, userId) => {
  try {
    const result = await Contact.findByIdAndRemove(id, { owner: userId });
    return result;
  } catch (error) {
    return error;
  }
};

const addContact = async (name, phone, email, userId) => {
  try {
    const result = await Contact.create({ name, phone, email, owner: userId });
    return result;
  } catch (error) {
    return error;
  }
};

const updateContact = async (id, body, userId) => {
  try {
    console.log(id, body);
    const result = await Contact.findByIdAndUpdate(id, body, {
      new: true,
      owner: userId,
    });
    return result;
  } catch (error) {
    return error;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
