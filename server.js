const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = 3019

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }))


mongoose.connect('mongodb+srv://adamchakour05:Adam4leena@friendfind.gxish.mongodb.net/FF_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.once('open', () => {
    console.log("Connected to MongoDB")
})

const userSchema = new mongoose.Schema({
    name:String,
    pronoun:String,
    enum: ['he/him', 'she/her', 'they/them'],
    interest1:String,
    enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
    interest2:String,
    enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
    interest3:String,
    enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
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
    await user.save()
    console.log(user)
    res.send("Form Submission Successful")
})

app.listen(port, () => {
    console.log("Server Started")
})