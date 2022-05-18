## 小西瓜养成计划

## TODO

1. 系统设计
   1. 成就系统
      1. 成就内容、成就检测、获取时间、展示样式
   2. 任务系统
      1. 任务类型（日常、周常、单次）
   3. 等级系统？

2. 页面规划
   1. 导航页（index）
      - [x]  检查当前信息和数据库的匹配情况，强制授权

   2. 首页（main）
      1. 成就
         - [x] 区别显示已完成与未完成成就

         - [x] 成就进度

         - [x] 多色奖杯，同类型渐进难度（红铜、白银、黄金）

         - [x] 给user添加字段

         - [x] 成就奖励弹窗

         - [ ] 成就奖励主题预览图
         
         - [x] 成就完成检测
         
         - [x] 建立成就数据集合
           1. ```json
              {
                  "type": "score",
                  "num": 500,
                  "desc": "累计获得500分",
                  "level": 0,
                  "title": "我好厉害！"
              }
              ```
           
           1. 累计积分、游戏参与次数、连续完成任务天数
         
      2. 背包
         - [x]  显示已兑换奖励
         - [x]  显示记录时间

      3. 悄悄话
         - [x] 备忘录
         - [x] 保存提示

      4. 游戏
         - [x] 随机增减积分

      5. TODO list

      6. 管理员编辑

         - [x] mission和reward的增删查改
         - [ ] ~~用户自由绑定管理员~~

      7. 近2天完成情况报告

   3. 任务（mission）
      - [x]  日常任务
      - [x]  周常任务
      - [ ]  完成记录（看下7天折线图是否容易实现）

   4. 奖励（exchange）
      - [x]  日常奖励
      - [x]  周常奖励

   5. 我的（profile）
      
      - [x] 构建设置页面
      - [ ] 颜色主题（暗黑、简白、黛西、星之卡比和玉桂狗）带图标
        - [获取当前主题](https://developers.weixin.qq.com/miniprogram/dev/api/base/system/wx.getSystemInfoSync.html)
        - [跨页面传参](https://www.jianshu.com/p/49f0e3bade27)
      
   6. 未来功能
      1. [绑定另一半并通过小程序订阅功能推送提醒](https://www.zhihu.com/question/52719661)
   
   7. 短期TODO
   
      - [ ] 添加record数据集合记录所有改变数据库的操作
      - [x] 使用progress代替成就页面的divider
      - [ ] 将数据库调用替换成云函数，[理由](https://developers.weixin.qq.com/community/develop/doc/00008603b683680f5d4caf69355c00)
      - [x] 将管理页面以外的列表显示部分提取成 Component
      - [ ] 设计成就奖励
      - [x] 九宫格grid显示首页
      - [ ] ~~使用原生icon~~
      - [x] 右划操作列表
      - [ ] ~~editor替换textarea~~
   
3. 待做任务优先级

   ```sequence
   设计成就奖励 -> 成就奖励主题预览图:
   多颜色主题 -> 成就奖励主题预览图:
   替换成云函数 -> 记录所有数据库操作:
   记录所有数据库操作 -> 完成记录折线图: 
   Note left of 用户自由绑定管理员: /
   ```
