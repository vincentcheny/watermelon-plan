const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command

exports.main = async (event, context) => {
    try {
        return await db.collection('user')
        .limit(100)
        .update({
            data: {
                daily_mission: _.set({}),
                daily_reward: _.set({}),
                gamble_limit: 8
            },
            success: (res) => {
                console.log('Clear daily mission successfully');
            },
            fail: (res) => {
                console.error('Fail to clear daily mission');
            }
        })
        // .get({
        //     success: (res) => {
        //         console.log('mission get success');
        //     },
        //     fail: (res) => {
        //         console.error('mission get fail');
        //     }
        // }).then( res => {
        //     var missions = res.data;;
        //     var daily = new Array();
        //     var weekly = new Array();
        //     for (var item of missions) {
        //         if (item.type == 'daily') {
        //             daily.push(item._id)
        //         } else if (item.type == 'weekly') {
        //             weekly.push(item._id)
        //         }
        //     }
        //     await db.collection('user').update({})
        //     return res.errMsg;//返回结果取决于return，过程中的console.log在日志中会显示
        // })
            // .update({
            //     data: {
            //         mission: {
                        
            //         }
            //     },
            // })
    } catch (e) {
        console.error(e)
    }
};