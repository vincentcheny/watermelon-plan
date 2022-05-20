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
                        weekly_mission: _.set({}),
                        weekly_reward: _.set({})
                    }
                })
        }
    } catch (e) {
        console.error(e)
    }
};