const { MongoClient, ObjectId } = require('mongodb');
const getMongoDb=async() => {
    const client=new MongoClient('mongodb://localhost:27017')
    try{
        await client.connect();
        const db = client.db('esdm_db');
        return db
    }
    catch(error){
        console.error(error)
        throw(error)
    }
}
module.exports={getMongoDb}