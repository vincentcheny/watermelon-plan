const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command

exports.main = async (event, context) => {
    try {
        let count = await db.collection('user').count();
        count = count.total;
        let skip_num = 100;
        for (let i = 0; i < count; i += skip_num) {
            await db.collection('user')
                .where({})
                .skip(skip_num)
                .limit(100)
                .update({
                    data: {
                        daily_mission: _.set({}),
                        daily_reward: _.set({}),
                        gamble_limit: 8
                    }
                })
        }
    } catch (e) {
        console.error(e)
    }
};