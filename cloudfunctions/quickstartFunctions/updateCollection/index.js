const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
    let data = {};
    let obj = event.data.update_objects;
    for (let name in obj) {
        if (obj[name].type == 'set') {
            data[[name]] = obj[name].value
        } else if (obj[name].type == 'add') {
            data[[name]] = db.command.inc(obj[name].value)
        } else if (obj[name].type == 'push') {
            data[[name]] = db.command.push([obj[name].value])
        }
    }
    try {
      return await db.collection(event.data.collection_name)
      .doc(event.data.id)
      .update({
        data: data
      })
    } catch(e) {
      console.error(e)
    }
  }