# TODO memos

- ui/nav
- feat/post
  難度: ★★★★☆
  - 前端: 將 post new 從新頁面改成置頂，手機板切換成小按鈕
  - 後端: 更改回復格式，將回覆視為post的一種
    - Prisma Schema
    - API
- feat/profile-card
  難度: ★☆☆☆☆
  - profile-card-horizontal-sm: 橫版小尺寸, hover 使用者名稱時顯示
  - profile-card-horizontal-lg: 橫版大尺寸, 放在mypage頁頭
  - profile-card-vertical-sm: 直版小尺寸，功能未定
  - profile-card-vertical-lg: 直版大尺寸，放在桌機板 Nav sheet 中
- feat/infinite-scroll: 首頁的post要能無限捲動
  難度: ★★☆☆☆
- feat/agolism: 演算法，根據使用者的喜好和習慣預測推文
  難度: ★★★★★
  - 有可能要更改資料庫結構 ( Prisma schema )
  - 盡量減少資料庫操作
  - 配合無限捲動
- feat/search
- feat/user-profile: 增加使用者基本資料，如賽事成績、拳齡
  難度: ★★★☆☆
  - 更動資料庫結構(Prisma Schema)
    - 新建 Profile 表格 (model Profile)，將基本資料與 User 分離，User 只保留登入需要的基本資料
    - User: id, useId, email, password
    - Profile: gender, birth, avatar, height身高, weight體重, description:自我介紹, record:賽事成績, train_start:訓練開始(西元年), stance: 站架, gym:所屬拳館
- feat/points: 積分系統
  - 獎勵系統
    - 發文 post
    - 評論 coment
    - 評分 rating
    - 贈與
    - 預測賽事成功 (投注)
  - 管理員回溯、管理
- feat/user-predict: 預測賽事結果
  - 讓使用者可以投入積分
  - 前端
    - 建立賽事頁面
    - 首頁也要有賽事區塊
  - 後端
    - 計算積分賠率
    - 根據賽事結果分配積分獎勵
- feat/rating: 評分系統
  - 參考虎撲
  - 分成賽事與選手
  - 選手評分系統可以考慮與使用者積分連動
  - 前端: 建立評分頁面
  - 後端
    - 更新資料庫結構
    - 建立評分API與Service
- feat/subscription: 訂閱
  - 前端: 顯示追蹤人數 Mypage, Profile-card
  - 後端: 更新資料庫結構
- feat/notifications: 通知
- feat/i18n: 多語言對應，英/日/簡中/繁中
- feat/auth-google: 用google帳號登陸
