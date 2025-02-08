import { parsePhoneNumber } from "awesome-phonenumber";

const stripPunctuation = (text) => {
  return text.replace(/[^a-zA-Z0-9À-ž\s]+/g, "").trim();
};

const matchesWholeWord = (text, word) => {
  if (!text || !word) return false;

  const ESCAPE_REGEX = /[.*+\-?^${}()|[\]\\]/g;
  const escapedWord = word.replace(ESCAPE_REGEX, "\\$&");

  const pattern = new RegExp(`\\b${escapedWord}\\b`, "i");
  const match = pattern.test(text);
  if (!match) return false;
  const wordLength = word.split(/\s+/).length;
  const scaleBy = wordLength > 1 ? 0.75 : 1;
  const textLength = text.split(/\s+/).length;
  return textLength <= wordLength * scaleBy * 4;
};

const matchValues = (text, fields) => {
  const { value } =
    fields.find(({ name, aliases = [] }) => {
      if (matchesWholeWord(text, name)) {
        return true;
      }

      return aliases.some((alias) => matchesWholeWord(text, alias));
    }) || {};

  return value;
};

const extractPhoneComponents = (phone) => {
  const formattedPhone = phone[0] === "+" ? phone : "+" + phone;
  const phoneNumber = parsePhoneNumber(formattedPhone);
  if (!phoneNumber) {
    throw new Error("Invalid phone number.");
  }

  const { countryCode, regionCode, number } = phoneNumber;

  return {
    countryCode: String(countryCode),
    country: regionCode,
    phoneNumber: number?.significant,
  };
};

const removeDiacritics = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove combining marks

export { stripPunctuation, matchesWholeWord, matchValues, extractPhoneComponents, removeDiacritics };
