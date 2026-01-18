import userModel from "../models/user/userModel.js";

// helper to build base studentId
const pad = (n) => n.toString().padStart(2,'0');

export const generateStudentIdBase = (name) => {
  const code = name.trim().replace(/\s+/g, "").slice(0, 3).toUpperCase();
  const now = new Date();
  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const year = now.getFullYear().toString().slice(-2);
  const hour = pad(now.getHours());
  return `${code}${day}${month}${year}${hour}`;
};
// ensure unique StudentId
export const ensureUniqueStudentId = async (base) => {
  let candidate = base;
  let i = 1;
  while (await userModel.findOne({ studentId: candidate })) {
    candidate = `${base}-${i}`;
    i++;
  }
  return candidate;
};

// helper to build base trainerId from name(first 3 char of name witout space)
export const trainerBaseFromName = (name) => {
  const cleaned = name.trim().replace(/\s+/g, "");
  return cleaned.slice(0, 3).toUpperCase();
};

// ensure unique trainerId
export const ensureUniqueTrainerId = async (base) => {
  let candidate;
  do {
    // Generate 3 random digits (0-9)
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    candidate = `${base}${randomDigits}`;
  } while (await userModel.findOne({ trainerId: candidate }));
  return candidate;
};
