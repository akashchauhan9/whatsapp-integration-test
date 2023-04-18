const User = require('../models/userModel');
const Post = require('../models/postModel');

const mongoose = require('mongoose');

// Get all users
const getUsers = async (request, response) => {
    try {
        const {search = '', page = 1, limit = 10} = request.query;
        const condition = {};
        if (search) {
            condition['$or'] = [
                {
                    name: { $regex: search, $options: 'i' }
                },
                {
                    username: { $regex: search, $options: 'i' }
                }
            ];
        };
        const users = await User.find(condition).skip((page-1)*limit).limit(limit).lean();
        const usersCount = await User.countDocuments(condition).lean();
        return response.status(200).json({ users, usersCount });
    } catch (error) {
        return response.status(404).json({ message: error.message })
    }
}

// Save data of the user in database
const addUser = async (request, response) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    const opts = { session };
    const user = request.body;

    let newUser = new User(user);
    try {
        const userExist = await User.findOne({email: request.body.email});
        const obj = {
            title: "hello2",
            description: "check2",
        }
        let newPost = new Post(obj);
        newPost = await newPost.save(opts);
        if(userExist) {
            await session.abortTransaction()
            return response.status(409).json({alreadyExist: true})
        }
        newUser = await newUser.save(opts);
        await session.commitTransaction();
        return response.status(201).json(newUser);
    } catch (error) {
        await session.abortTransaction()
        return response.status(409).json({ message: error.message });
    }
    finally{
        session.endSession();
    }
}

// Get a user by id
const getUserById = async (request, response) => {
    try {
        const user = await User.findById({_id: request.params.id}, {email: 1, username: 1, phone: 1, name: 1});
        return response.status(200).json(user);
    } catch (error) {
        return response.status(404).json({ message: error.message })
    }
}

// Save data of edited user in the database
const editUser = async (request, response) => {
    try {
        const user = request.body;

        const editUser = await User.updateOne({ _id: request.params.id }, user);
        return response.status(201).json(editUser);
    } catch (error) {
        return response.status(409).json({ message: error.message });
    }
}

// deleting data of user from the database
const deleteUser = async (request, response) => {
    try {
        await User.deleteOne({ _id: request.params.id });
        return response.status(201).json("User deleted Successfully");
    } catch (error) {
        return response.status(409).json({ message: error.message });
    }
}

module.exports = {
    getUsers,
    addUser,
    getUserById,
    editUser,
    deleteUser
}