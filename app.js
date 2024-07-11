const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const generateShortId = require('ssid');
const QRCode = require('qrcode');
const mongoose = require("mongoose");
const path = require('path');
const multer = require('multer');
require('dotenv').config();
const app = express();

mongoose.connect(process.env.DB_STRING)
    .then(() => console.log("Connected"))
    .catch(err => console.error(err));

const usernameMappingSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    token: {
        type: String,
        require: true
    },
    mapping_token: {
        type: String,
        require: true
    },
    avatar: {
        type: String,
        required: false
    }
}, { timestamps: true });

const usernameMappingModel = mongoose.model("username_token_mapping", usernameMappingSchema);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('avatar');

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNiZGI4ZDJkLTc4NzUtNDVkNC04NDc3LTlmNTlkOWVhYzkwOCIsImlhdCI6MTcxODg3NzY3NX0.SKKuxZiCQcGAR4bowLsPAgeWbsfbWlkPgzPvZkwQ86w";

app.get('/register', async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register_new.html"));
});

app.get('/dashboard', async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard_new.html"));
});

app.get('/send', async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "send_new.html"));
});

app.get('/receive', async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "receive_new.html"));
});

app.get('/history', async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "history.html"));
});

app.get('/test', async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "test.html"));
});

// Modify the register route to handle avatar upload
app.post('/api/register', async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400).json({ message: err });
        } else {
            if (req.file == undefined) {
                res.status(400).json({ message: 'No file selected!' });
            } else {
                try {
                    const response = await axios.post('https://coinos.io/api/register', req.body, {
                        headers: {
                            'content-type': 'application/json'
                        }
                    });

                    // Save user data along with avatar path
                    await usernameMappingModel.create({
                        username: req.body.username,
                        token: response.data.token,
                        mapping_token: await generateShortId(12),
                        avatar: req.file.path
                    });

                    res.status(200).json({ message: 'User registered successfully', file: `uploads/${req.file.filename}` });
                } catch (error) {
                    res.status(500).json({ error: error.response.data });
                }
            }
        }
    });
});

app.post('/api/login', async (req, res) => {
    try {
        const response = await axios.post('https://coinos.io/api/login', req.body);
        if (response.data && response.data.token) {
            const mapping_token = await generateShortId(12);
            await usernameMappingModel.create({
                username: req.body.username,
                token: response.data.token,
                mapping_token: mapping_token
            })
            response.data.token = mapping_token;
            res.json(response.data);
        } else {
            res.status(500).json({ error: "Something went wrong! Please try again" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/invoice', async (req, res) => {
    try {
        const mapping_token = req.headers.authorization;
        const token_mapping = await usernameMappingModel.findOne({ mapping_token }).sort({ createdAt: -1 }).lean().exec();
        const response = await axios.post('https://coinos.io/api/invoice', req.body, {
            headers: {
                Authorization: `Bearer ${token_mapping.token}`,
                'Content-Type': 'application/json'
            }
        });
        response.data.qr_code_image = await QRCode.toDataURL(response.data.hash);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const mapping_token = req.headers.authorization;
        const token_mapping = await usernameMappingModel.findOne({ mapping_token }).sort({ createdAt: -1 }).lean().exec();
        const response = await axios.post('https://coinos.io/api/payments', req.body, {
            headers: {
                Authorization: `Bearer ${token_mapping.token}`,
                'Content-Type': 'application/json'
            }
        });
        res.json("Response : ", response.data);
    } catch (error) {
        res.status(500).json({ error: error.response.data });
    }
});

app.get('/api/payments', async (req, res) => {
    try {
        const mapping_token = req.headers.authorization;
        const token_mapping = await usernameMappingModel.findOne({ mapping_token }).sort({ createdAt: -1 }).lean().exec();
        const response = await axios.get('https://coinos.io/api/payments', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token_mapping.token}`
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response.data })
    }
});

app.post('/api/username-payments', async (req, res) => {
    try {
        const mapping_token = req.headers.authorization;
        const token_mapping = await usernameMappingModel.findOne({ mapping_token }).sort({ createdAt: -1 }).lean().exec();
        // First request to create an invoice
        const invoiceResponse = await axios.post('https://coinos.io/api/invoice', {
            invoice: { amount: req.body.amount, type: 'lightning' },
            user: { username: req.body.username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token_mapping.token}}`
            }
        });
        const hash = invoiceResponse.data.hash;
        // Second request to make a payment
        const paymentResponse = await axios.post('https://coinos.io/api/payments', {
            amount: req.body.amount,
            hash: hash
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token_mapping.token}`
            }
        });

        console.log('Payment Response:', paymentResponse.data);
        res.status(200).json(paymentResponse.data);
    } catch (error) {
        res.status(500).json({ error: error })
    }
});

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
