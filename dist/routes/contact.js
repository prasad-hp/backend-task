"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const contactSchema_1 = __importDefault(require("../validators/contactSchema"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userInput = req.body;
    const parsedData = contactSchema_1.default.safeParse(userInput);
    if (!parsedData.success) {
        return res.status(400).json(parsedData.error.issues[0].message || "Please enter valid data");
    }
    const { email, phoneNumber } = userInput;
    console.log(email, phoneNumber);
    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Email or phoneNumber is required' });
    }
    try {
        if (email === null && phoneNumber === null) {
            return res.status(400).json({ error: 'please provide valid data' });
        }
        const contacts = yield prisma.contact.findMany({
            where: {
                OR: [
                    { email },
                    { phoneNumber }
                ]
            }
        });
        // Case 1: No matching contact found
        if (contacts.length === 0) {
            const newContact = yield prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: 'primary'
                }
            });
            return res.status(200).json({
                contact: {
                    primaryContactId: newContact.id,
                    emails: [newContact.email].filter(Boolean),
                    phoneNumbers: [newContact.phoneNumber].filter(Boolean),
                    secondaryContactIds: []
                }
            });
        }
        if (email === null && phoneNumber !== null) {
            const contacts = yield prisma.contact.findMany({
                where: {
                    OR: [
                        { phoneNumber }
                    ]
                }
            });
            // Case 1: No matching contact found
            if (contacts.length === 0) {
                const newContact = yield prisma.contact.create({
                    data: {
                        email,
                        phoneNumber,
                        linkPrecedence: 'primary'
                    }
                });
                return res.status(200).json({
                    contact: {
                        primaryContactId: newContact.id,
                        emails: [newContact.email].filter(Boolean),
                        phoneNumbers: [newContact.phoneNumber].filter(Boolean),
                        secondaryContactIds: []
                    }
                });
            }
            // Case 2: Matching contact(s) found
            let primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary');
            if (!primaryContact) {
                primaryContact = contacts[0];
                yield prisma.contact.update({
                    where: { id: primaryContact.id },
                    data: { linkPrecedence: 'primary' }
                });
            }
            const secondaryContacts = contacts.filter(contact => contact.id !== primaryContact.id);
            // Check if phone number match any existing contact
            if (contacts.some(contact => contact.phoneNumber === phoneNumber)) {
                return res.status(200).json({
                    contact: {
                        primaryContactId: primaryContact.id,
                        emails: [primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter(Boolean),
                        phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter(Boolean),
                        secondaryContactIds: secondaryContacts.map(contact => contact.id)
                    }
                });
            }
        }
        if (phoneNumber === null && email !== null) {
            const contacts = yield prisma.contact.findMany({
                where: {
                    OR: [
                        { email }
                    ]
                }
            });
            // Case 1: No matching contact found
            if (contacts.length === 0) {
                const newContact = yield prisma.contact.create({
                    data: {
                        email,
                        phoneNumber,
                        linkPrecedence: 'primary'
                    }
                });
                return res.status(200).json({
                    contact: {
                        primaryContactId: newContact.id,
                        emails: [newContact.email].filter(Boolean),
                        phoneNumbers: [newContact.phoneNumber].filter(Boolean),
                        secondaryContactIds: []
                    }
                });
            }
            // Case 2: Matching contact(s) found
            let primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary');
            if (!primaryContact) {
                primaryContact = contacts[0];
                yield prisma.contact.update({
                    where: { id: primaryContact.id },
                    data: { linkPrecedence: 'primary' }
                });
            }
            const secondaryContacts = contacts.filter(contact => contact.id !== primaryContact.id);
            // Check if email match any existing contact
            if (contacts.some(contact => contact.email === email)) {
                return res.status(200).json({
                    contact: {
                        primaryContactId: primaryContact.id,
                        emails: [primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter(Boolean),
                        phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter(Boolean),
                        secondaryContactIds: secondaryContacts.map(contact => contact.id)
                    }
                });
            }
        }
        // Case 2: Matching contact(s) found
        let primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary');
        if (!primaryContact) {
            primaryContact = contacts[0];
            yield prisma.contact.update({
                where: { id: primaryContact.id },
                data: { linkPrecedence: 'primary' }
            });
        }
        const secondaryContacts = contacts.filter(contact => contact.id !== primaryContact.id);
        // Check if both email and phone number match any existing contact
        if (contacts.some(contact => contact.email === email && contact.phoneNumber === phoneNumber)) {
            return res.status(200).json({
                contact: {
                    primaryContactId: primaryContact.id,
                    emails: [primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter(Boolean),
                    phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter(Boolean),
                    secondaryContactIds: secondaryContacts.map(contact => contact.id)
                }
            });
        }
        // Check if either email or phone number matches any existing contact
        if ((email && contacts.some(contact => contact.email === email)) || (phoneNumber && contacts.some(contact => contact.phoneNumber === phoneNumber))) {
            //   return res.status(200).json({
            // Create a new secondary contact if one of the inputs is new
            const newSecondaryContact = yield prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkedId: primaryContact.id,
                    linkPrecedence: 'secondary'
                }
            });
            secondaryContacts.push(newSecondaryContact);
            return res.status(200).json({
                contact: {
                    primaryContactId: primaryContact.id,
                    emails: [primaryContact.email, ...secondaryContacts.map(contact => contact.email)].filter(Boolean),
                    phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)].filter(Boolean),
                    secondaryContactIds: secondaryContacts.map(contact => contact.id)
                }
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = router;
