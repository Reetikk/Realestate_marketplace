const User = require('../models/User');
const Query = require('../models/Query');
const Property = require('../models/Property');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendLoginAlert } = require('../utils/sendEmail');
const mongoose = require('mongoose');

const nodemailer = require("nodemailer");

const getstatNo = async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments({ postedBy: req.user.id });
        const totalQueries = await Query.countDocuments({ buyer: req.user.id });

        const totalCostAgg = await Property.aggregate([
            {
                $match: {
                    postedBy: new mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$price" }
                }
            }
        ]);
        const totalBookmarks = await User.findById(req.user.id);


        res.status(200).json({
            success: true,
            data: {
                totalProperties,
                totalQueries,
                totalCost: totalCostAgg.length > 0 ? totalCostAgg[0].total : 0,
                totalBookmarks: totalBookmarks ? totalBookmarks.bookmarks.length : 0
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Create a new user
const createUser = async (req, res) => {
    try {
        const { name, email, password, number, city, state, zipcode } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            })
        }
        const user = await User.create({ name, email, password, number, city, state, zipcode });
        console.log(email, name);
        sendWelcomeEmail(email, name);
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Update a user by ID

// const updateuser = async (req, res) => {
//     try {
//         const user = await User.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true })

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             })
//         }
//         res.status(200).json({
//             success: true,
//             data: user
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

const updateuser = async (req, res) => {
    try {
        // 1. Find the user first
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 2. Update the fields from req.body
        // This handles name, email, number, city, etc.
        Object.keys(req.body).forEach((update) => {
            user[update] = req.body[update];
        });

        // 3. Use .save() so the pre('save') hook in your schema triggers!
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a user by ID

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 2. Compare the typed password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 3. If password matches, create the JWT token!
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token lasts for 1 day
        );
        sendLoginAlert(user.email, user.name);
        // 4. Send back the token and user data
        res.status(200).json({
            success: true,
            token: token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                number: user.number
            },
            message: 'Login successful'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getuserbyId = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


const toggleBookmark = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { propertyId } = req.body;

        const index = user.bookmarks.indexOf(propertyId);

        if (index === -1) {
            user.bookmarks.push(propertyId);
        } else {
            user.bookmarks.splice(index, 1);
        }

        await user.save();

        res.json({
            success: true,
            bookmarks: user.bookmarks
        });

    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

const getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'bookmarks',
            select: 'title description price address city state bedrooms bathrooms square_foot image parking postedBy'
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        res.status(200).json({
            success: true,
            data: user.bookmarks
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

const sendQuery = async (req, res) => {
    const {
        sellerEmail,
        buyerName,
        buyerEmail,
        buyerPhone,
        propertyTitle,
        message,
        propertyId,
        sellerId
    } = req.body;


    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: sellerEmail,
            subject: `Query for ${propertyTitle}`,
            replyTo: buyerEmail,
            text: `
Property: ${propertyTitle}

Buyer:
Name: ${buyerName}
Email: ${buyerEmail}
Phone: ${buyerPhone}

Message:
${message}
      `
        });

        const newQuery = await Query.create({
            property: propertyId,
            seller: sellerId,
            buyer: req.user.id, // from JWT middleware
            message: message
        });

        res.json({
            success: true,
            msg: "Query sent",
            data: newQuery
        });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getQueries = async (req, res) => {
    try {
        const queries = await Query.find({ buyer: req.user.id })
            .populate("property", "title")
            .populate("seller", "name email");

        res.json(queries);
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message
        });
    }
};

const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const avatarUrl = req.file.path;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarUrl },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const userController = {
    createUser,
    updateuser,
    deleteUser,
    loginUser,
    getuserbyId,
    toggleBookmark,
    getBookmarks,
    sendQuery,
    getQueries,
    updateAvatar,
    getstatNo

}

module.exports = userController;