const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
    const { first_name, last_name, email, phone, password} = req.body;
    const url_user_image = req.file?.buffer;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const newUser = await User.create({
            first_name,
            last_name,
            url_user_image,
            email,
            phone,
            password:hashedPassword,
            account_type_id: 1, 
        });
        res.status(201).json({ message: 'User registered successfully', user: newUser.id });
    } catch (error) {
        res.status(500).json({ error : 'Internal Server Error'});
        console.error('Error registering user: ', error);
    }
}

exports.getProfileImage = async (req,res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if(!user || !user.url_user_image) {
            return res.status(404).send('Image Not Found');
        }

        res.set('Content-Type', 'image/jpeg');
        res.send(user.url_user_image);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error fetching profile image: ', error);
    }
}

exports.loginUser = async (req,res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email }});

        if (!user) {
            return res.status(404).json({ error: 'User Not Found' });
        }

        const isMatch = bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid Password' });
        }

        res.status(200).json({ message: 'Login Successful', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error logging in user: ', error);
    }
}

exports.getUserById = async (req,res) => {
    const { id } = req.params;

    try {
        
        const user = await User.findByPk(id);

        if(!user) {
            return res.status(404).json({ error: 'User Not Found' });
        }

        res.status(200).json({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            reward_status: user.reward_status,
            email: user.email,
            phone: user.phone,
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error fetching user by ID: ', error);
    }
}

