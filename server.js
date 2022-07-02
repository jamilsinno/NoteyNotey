const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express()
const PORT = 8000

let dbConnectionStr = process.env.DB_STRING, 
    dbName = 'notes'

const client = await getMongoClient()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

async function getDate(){
    try{
        const response = await fetch('https://worldtimeapi.org/api/ip')
        const data = await response.json()

        const date = data.datetime.split('').slice(0, data.datetime.indexOf('T')).join('')
        console.log(date)
        return date
    }catch(error){
        console.log(error)
    }
}

app.post('/addNote', async (request, response) => {
    //  we assign the async function that fetches the date from an api a variable below. It will give us the date the note was added because the post request
    // is triggered "whenever" the user adds the note.
    const dateAdded = await getDate()

    // added the dateAdded variables to the document so it can be retrieved from the main template
    try {
        db.collection(dbName).insertOne({noteTitle: request.body.noteTitle,
        noteBody: request.body.noteBody, dateAdded})

        console.log('Note Added')
        response.redirect('/')
    } catch(error) {
        console.log('Failed to add note')
        console.log(error)
    }
})

// app.get('/readNote', async(request, response) => {
//     // use this section to read notes based on the calendar dates
// })

// app.put('/changeNote', async(request, response) => {
//     // use this section to update the notes once they've been posted
// })

app.delete('/deleteNote', async(request, response) => {
    try {
        const result = await db.collection(dbName).deleteOne({noteTitle: request.body.noteTitleS.trim()})
        console.log('Note Deleted')
        response.json('Note Deleted')
    } catch(error) {
        console.error(error)
    }
})


MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
    .then( client => {

        console.log(`Conneted to the ${dbName} database`)
        const db = client.db(dbName)

        db.collection(dbName).createIndex({noteTitle:1}, {unique:true})
        app.listen(process.env.PORT || PORT, ()=>{
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch( err => console.error(err))




