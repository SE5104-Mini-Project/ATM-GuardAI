import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './counterModel.js';

const userSchema = new mongoose.Schema({
    _id: { type: String },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isNew) return next(); 

    try {
        const counter = await Counter.findOneAndUpdate(
            { name: 'user' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const seqNumber = counter.seq.toString().padStart(2, '0');
        user._id = `user_${seqNumber}`;

        if (user.isModified('password')) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
        }

        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

export default mongoose.model('User', userSchema);