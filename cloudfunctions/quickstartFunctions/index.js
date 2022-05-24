const getOpenId = require('./getOpenId/index');
const getUserByOpenId = require('./getUserByOpenId/index');
const getCollection = require('./getCollection/index');
const getBag = require('./getBag/index');
const addUser = require('./addUser/index');


// 云函数入口函数
exports.main = async (event, context) => {
    console.log('cloud function entrance');
    console.log(event);
    switch (event.type) {
        case 'getOpenId':
            return await getOpenId.main(event, context);
        case 'getUserByOpenId':
            return await getUserByOpenId.main(event, context);
        case 'getCollection':
            return await getCollection.main(event, context);
        case 'getBag':
            return await getBag.main(event, context);
        case 'addUser':
            return await addUser.main(event, context);
    }
};