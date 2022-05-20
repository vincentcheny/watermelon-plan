const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
    const data = event.data
    // 返回数据库查询结果
    const _ = db.command
    if (data.type instanceof Array) {
        let temp = Array();
        for (let i in data.type) {
            temp.push(_.eq(data.type[i]))
        }
        return await db.collection('achievement').where({
            type: _.or(temp)
        }).get();
    } else {
        return await db.collection('achievement').where({
            type: data.type
        }).get();
    }
};