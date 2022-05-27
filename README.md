# 小西瓜养成计划

## 项目概况

小西瓜养成计划作为练手级别情侣微信小程序，支持任务完成、奖励兑换、记事本和 TODO List 等功能，方便情侣进行日常互动与事务记录

## 项目结构（部分）

```bash
.
├── cloudfunctions # 参考资料：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html
│   ├── quickstartFunctions # 包含程序主体所用的数据库调用函数
│   ├── refreshDBDaily # 刷新每日任务与每日兑换
│   └── refreshDBWeekly
└── miniprogram
    ├── app.wxss # 全局样式
    ├── components
    │   └── list # 基于 slideview 的自定义组件
    ├── image # 包含无法被 tabbar 引用云储存链接的图标
    └── pages # 各页面主体
        ├── exchange
        ├── index
        ├── main
        ├── mission
        └── profile
```

## 预览

## 功能规划与开发进度

1. 系统设计
   1. 成就系统
      1. 成就内容、成就检测、获取时间、展示样式
   2. 任务系统
      1. 任务类型（日常、周常、其它）
   
2. 页面规划
   1. 导航页（index）
      - [x]  检查当前信息和数据库的匹配情况，强制要求授权

   2. 首页（main）
   
      - [x] 九宫格grid显示首页

      1. 成就
         - [x] 根据完成情况与难度（红铜、白银、黄金）显示不同图标，用进度条标记具体进度
         - [x] 长按弹窗奖励
         - [ ] ~~成就奖励主题预览图~~
         - [x] 成就完成检测
         - [x] 建立成就数据集合
           1. 累计积分、游戏参与次数、连续完成任务天数、周年纪念
      2. 背包
         - [x]  显示已兑换奖励
         - [x]  显示记录时间
      3. 悄悄话
         - [x] 备忘录
         - [x] 保存提示
         - [ ] ~~editor替换textarea~~
      4. 游戏
         - [x] 随机增减积分
      5. TODO list
      6. 管理员编辑
   
         - [x] mission和reward的增删查改
         - [ ] ~~用户自由绑定管理员~~
         - [ ] 显示对方完整数据与分值编辑
      7. ~~近2天完成情况报告~~
   
   3. 任务（mission）
      - [x] 日常任务、周常任务、其它（一次性）任务
      - [ ]  完成记录（看下7天折线图是否容易实现）
   
   4. 奖励（exchange）
      - [x] 日常奖励、周常奖励、其它（一次性）奖励
   
   5. 我的（profile）
   
      - [x] 构建设置页面
      - [x] 颜色主题（暗黑、简白、星之卡比和玉桂狗）带图标
        - [获取当前主题](https://developers.weixin.qq.com/miniprogram/dev/api/base/system/wx.getSystemInfoSync.html)
      - [x] 实现成就奖励解锁皮肤
      - [x] 全局主题背景和对应标签栏图标
        - 准备图标

        - 首页和profile根据主题切换设置图标，注意暗黑模式的捕获
        - 尝试点击时进行同一图标的大小切换
   
   6. 组件

      - [x] 将管理页面以外的列表显示部分提取成 Component
      - [x] 左划操作列表
      - [x] 填充列表中的更多信息
   
   7. 未来功能
      1. [绑定另一半并通过小程序订阅功能推送提醒](https://www.zhihu.com/question/52719661)

   8. 短期TODO
   
      - [x] 添加record数据集合记录所有改变数据库的操作（操作全部走云函数，方便通过云函数调用记录查询）
      - [x] 将数据库调用替换成云函数，[理由](https://developers.weixin.qq.com/community/develop/doc/00008603b683680f5d4caf69355c00)
      - [ ] ~~使用原生icon~~
      - [x] 缓存变量，减少数据库调用次数
