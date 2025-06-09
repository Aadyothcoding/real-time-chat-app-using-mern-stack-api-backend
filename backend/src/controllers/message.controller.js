import User from '../models/user.model.js';
import Message from '../models/message.model.js';

export const getUsersForSidebar = async (req, res) => {

    try{
        const loggedInUserId = req.user._id; // Assuming req.user is set by the auth middleware
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.status(200).json(filteredUsers);
    }catch(error)
    {
        console.error('Error fetching users for sidebar:', error);
        res.status(500).send('Internal Server Error');

    }
}

export const getMessages = async (req, res) => {
    try{
        const{id:userToChatId} = req.params;
        const myId = req.user._id; // Assuming req.user is set by the auth middleware

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiver: userToChatId },
                { senderId: userToChatId, receiver: myId }
            ]
        })

        res.status(200).json(messages);
    }catch(error)
    {
        console.log('Error fetching messages:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const sendMessage = async (req, res) => {
    try{
        const{text,image}= req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id; // Assuming req.user is set by the auth middleware

        let imageUrl;
        if(image){
            const uploadResponse= await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl || null
        });

        await newMessage.save();

        //real time functionality will be insereted here later
        res.status(200).json(newMessage);
    }catch(error)
    {
        console.log('Error sending message:', error);
        res.status(500).send('Internal Server Error');
    }
}