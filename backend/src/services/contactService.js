import Contact from "../models/Contact.js";
import User from "../models/User.js";

export const addContact = async (userId, { name, phone, relationship, isPrimaryContact = false, isSOSContact = true }) => {
  // Check if contact with this phone already exists for the user
  const existingContact = await Contact.findOne({ userId, phone });
  if (existingContact) {
    const error = new Error("You have already added this contact.");
    error.statusCode = 400;
    throw error;
  }

  // Handle constraints
  if (isPrimaryContact) {
    // Unset any existing primary contact
    await Contact.updateMany({ userId }, { isPrimaryContact: false });
  }

  if (isSOSContact) {
    const sosCount = await Contact.countDocuments({ userId, isSOSContact: true });
    if (sosCount >= 3) {
      const error = new Error("You can only have up to 3 SOS contacts.");
      error.statusCode = 400;
      throw error;
    }
  }

  const newContact = new Contact({
    userId,
    name,
    phone,
    relationship,
    isPrimaryContact,
    isSOSContact
  });

  await newContact.save();

  // Add reference to User model
  await User.findByIdAndUpdate(userId, {
    $push: { emergencyContacts: newContact._id }
  });

  return newContact;
};

export const updateContact = async (userId, contactId, updates) => {
  const contact = await Contact.findOne({ _id: contactId, userId });
  if (!contact) {
    const error = new Error("Contact not found.");
    error.statusCode = 404;
    throw error;
  }

  if (updates.isPrimaryContact && !contact.isPrimaryContact) {
    // Unset other primary contacts
    await Contact.updateMany({ userId, _id: { $ne: contactId } }, { isPrimaryContact: false });
  }

  if (updates.isSOSContact && !contact.isSOSContact) {
    const sosCount = await Contact.countDocuments({ userId, isSOSContact: true });
    if (sosCount >= 3) {
      const error = new Error("You can only have up to 3 SOS contacts.");
      error.statusCode = 400;
      throw error;
    }
  }

  Object.assign(contact, updates);
  await contact.save();
  
  return contact;
};

export const getContacts = async (userId) => {
  return await Contact.find({ userId });
};

export const removeContact = async (userId, contactId) => {
  const deletedContact = await Contact.findOneAndDelete({ _id: contactId, userId });
  if (!deletedContact) {
    const error = new Error("Contact not found or you do not have permission to delete it.");
    error.statusCode = 404;
    throw error;
  }

  // Remove reference from User model
  await User.findByIdAndUpdate(userId, {
    $pull: { emergencyContacts: contactId }
  });

  return deletedContact;
};
