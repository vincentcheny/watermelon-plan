const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
    const data = event.data
    console.log(data);
    // 返回数据库查询结果
    return await db.collection('user').add({
        data: {
            _openid: data.openid,
            avatar_url: data.avatarUrl,
            user_name: data.user_name,
            user_gender: data.user_gender,
            update_time: data.today,
            user_integral: 0,
            daily_mission: {},
            weekly_mission: {},
            daily_reward: {},
            weekly_reward: {},
            message: '',
            gamble_combo: 0,
            gamble_limit: 8,
            achievement_data: {
                num_game: 0,
                num_200_game: 0,
                num_1000_game: 0,
                last_mission: data.yesterday,
                cur_mission_combo: 0,
                total_integral: 0,
                max_mission_combo: 0
            },
            achievement: [],
            theme: 'white'
        }
    });
};