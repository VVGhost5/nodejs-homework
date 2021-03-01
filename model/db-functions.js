const Contact = require("./schemas/contact");

const listContacts = async () => {
  try {
    const results = await Contact.find({});
    return results;
  } catch (error) {
    return error;
  }
};

const getContactById = async (id) => {
  try {
    const result = await Contact.find({ _id: id });
    return result;
  } catch (error) {
    return error;
  }
};

const removeContact = async (id) => {
  try {
    const result = await Contact.findByIdAndRemove({
      _id: id,
    });
    return result;
  } catch (error) {
    return error;
  }
};

const addContact = async (name, phone, email) => {
  try {
    const result = await Contact.create({ name, phone, email });
    return result;
  } catch (error) {
    return error;
  }
};

const updateContact = async (contactId, contact) => {
  try {
    const result = await Contact.findByIdAndUpdate(
      { _id: contactId },
      { ...contact },
      { new: true }
    );
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
