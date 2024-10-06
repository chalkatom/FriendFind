const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = 3019

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }))


mongoose.connect('mongodb+srv://adamchakour05:C5ygFeBcxpPDaNg2@ffcluster.8ojuf.mongodb.net/FFdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.once('open', () => {
    console.log("Connected to MongoDB")
})

const userSchema = new mongoose.Schema({
    name: String,
    pronoun: {
        type: String,
        enum: ['he/him', 'she/her', 'they/them'],
    },
    interest1: {
        type: String,
        enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
    },
    interest2: {
        type: String,
        enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
    },
    interest3: {
        type: String,
        enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
    },
    question1: { type: String, default: '' },
    answer1: { type: String, default: '' },
    wrong1a: { type: String, default: '' },
    wrong1b: { type: String, default: '' },
    wrong1c: { type: String, default: '' },
    question2: { type: String, default: '' },
    answer2: { type: String, default: '' },
    wrong2a: { type: String, default: '' },
    wrong2b: { type: String, default: '' },
    wrong2c: { type: String, default: '' },
    question3: { type: String, default: '' },
    answer3: { type: String, default: '' },
    wrong3a: { type: String, default: '' },
    wrong3b: { type: String, default: '' },
    wrong3c: { type: String, default: '' },
});

const Users = mongoose.model("data", userSchema)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'FFmainpage.html'))
})

app.post('/post', async (req, res) => {
    const { name, pronoun, interest1, interest2, interest3 } = req.body
    const user = new Users({
        name,
        pronoun,
        interest1,
        interest2,
        interest3
    })
    try {
        await user.save()
        console.log(user)
        res.send("Form Submission Successful")
    } catch(error) {
        console.log(error)
        res.send("Form Submission Failed")
    }
})

app.listen(port, () => {
    console.log("Server Started")
})
