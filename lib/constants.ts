// TODO: Replace with proper i18n translation system (e.g., next-intl, i18next)

/**
 * Application-wide constants and multilingual text content
 * Supports: English (en), Japanese (ja), Chinese (cn)
 */

export type Language = "en" | "ja" | "cn";

export const APP_CONSTANTS = {
  // Validation limits
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,
  MAX_COMMENT_LENGTH: 2000,
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 6,

  // Pagination
  POSTS_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 10,

  // File upload
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],

  // Categories (internal keys)
  POST_CATEGORIES: [
    "general",
    "question",
    "discussion",
    "announcement",
  ] as const,

  // User roles (internal keys)
  USER_ROLES: {
    ADMIN: "admin",
    USER: "user",
  },
} as const;

// Multilingual text content
export const TRANSLATIONS = {
  en: {
    // Application info
    APP_NAME: "Boxing Buddies World",
    APP_SHORT_NAME: "BBW",
    APP_DESCRIPTION:
      "A boxing community for boxing buddies to share their thoughts and experiences worldwide.",

    // Home page
    HOME_WELCOME: "Welcome to BBW",
    HOME_SUBTITLE: "Share your thoughts, connect with others",
    HOME_NO_POSTS: "No posts yet",
    HOME_CREATE_FIRST_POST: "Create the first post",

    // Common actions
    SAVE: "Save",
    CANCEL: "Cancel",
    DELETE: "Delete",
    EDIT: "Edit",
    SUBMIT: "Submit",
    LOADING: "Loading...",
    REPLY: "Reply",
    LIKE: "Like",
    VIEW: "View",
    SHARE: "Share",
    SEE_MORE: "See more",

    // Error messages
    ERROR_GENERIC: "Something went wrong. Please try again.",
    ERROR_UNAUTHORIZED: "You are not authorized to perform this action.",
    ERROR_NOT_FOUND: "The requested resource was not found.",
    ERROR_INVALID_INPUT: "Invalid input. Please check your data.",
    ERROR_NETWORK: "Network error. Please check your connection.",

    // Success messages
    SUCCESS_SAVED: "Successfully saved!",
    SUCCESS_DELETED: "Successfully deleted!",
    SUCCESS_UPDATED: "Successfully updated!",
    SUCCESS_CREATED: "Successfully created!",

    // Categories
    CATEGORY_GENERAL: "General",
    CATEGORY_QUESTION: "Question",
    CATEGORY_DISCUSSION: "Discussion",
    CATEGORY_ANNOUNCEMENT: "Announcement",

    // User roles
    ROLE_ADMIN: "Admin",
    ROLE_USER: "User",

    // Auth
    LOGIN: "Login",
    LOGOUT: "Logout",
    REGISTER: "Register",
    EMAIL: "Email",
    PASSWORD: "Password",
    USERNAME: "Username",
    ALREADY_HAVE_ACCOUNT: "Already have an account?",
    DONT_HAVE_ACCOUNT: "Don't have an account?",

    // Post
    POST: "Post",
    POSTS: "Posts",
    NEW_POST: "New Post",
    TITLE: "Title",
    CONTENT: "Content",
    TAGS: "Tags",
    CATEGORY: "Category",
    SELECT_CATEGORY: "Select category",
    TAGS_COMMA_SEPARATED: "Tags (comma separated)",
    VIEWS: "views",
    UPDATING_POST: "Updating post...",
    POST_UPDATED_SUCCESS: "Post updated successfully!",
    FAILED_TO_UPDATE_POST: "Failed to update post",
    FAILED_TO_LOAD_POST: "Failed to load post",
    LOGIN_TO_COMMENT: "to comment",
    NO_COMMENTS_BE_FIRST: "No comments yet. Be the first to comment!",
    TITLE_REQUIRED: "Title is required",
    CONTENT_REQUIRED: "Content is required",
    CATEGORY_REQUIRED: "Category is required",

    // Comment
    COMMENT: "Comment",
    COMMENTS: "Comments",
    ADD_COMMENT: "Add Comment",

    // Profile & Admin
    PROFILE: "Profile",
    SETTINGS: "Settings",
    AVATAR: "Avatar",
    ADMIN_DASHBOARD: "Admin Dashboard",
    MANAGE_CATEGORIES_POSTS_USERS: "Manage categories, posts, and users",
    ABOUT: "About",
    EDIT_PROFILE: "Edit Profile",
    NAME: "Name",
    BIRTHDAY: "Birthday",
    GENDER: "Gender",
    MEMBER_SINCE: "Member since",
    JOINED: "Joined",
    POINTS: "Points",
    LIKES: "Likes",
    NO_POSTS_YET: "No posts yet",
    BACK_TO_PROFILE: "Back to Profile",
    POSTS_BY: "'s Posts",
    POST_SINGULAR: "post",
    POST_PLURAL: "posts",
    COMMENTS_BY: "'s Comments",
    COMMENT_SINGULAR: "comment",
    COMMENT_PLURAL: "comments",
    NO_COMMENTS_YET: "No comments yet",
    LIKES_LABEL: "likes",
    REPLIES_LABEL: "replies",
    LIKED_CONTENT: "Liked Content",
    LIKED_POSTS: "Liked Posts",
    LIKED_COMMENTS: "Liked Comments",
    NO_LIKED_POSTS: "No liked posts yet",
    NO_LIKED_COMMENTS: "No liked comments yet",
    ON: "on",
  },

  ja: {
    // Application info
    APP_NAME: "ボクシング仲間の会",
    APP_SHORT_NAME: "BBS",
    APP_DESCRIPTION:
      "ボクシング仲間が世界中で考えや経験を共有するためのコミュニティ。",

    // Home page
    HOME_WELCOME: "BBSへようこそ",
    HOME_SUBTITLE: "あなたの考えをシェアし、他の人とつながりましょう",
    HOME_NO_POSTS: "まだ投稿がありません",
    HOME_CREATE_FIRST_POST: "最初の投稿を作成",

    // Common actions
    SAVE: "保存",
    CANCEL: "キャンセル",
    DELETE: "削除",
    EDIT: "編集",
    SUBMIT: "送信",
    LOADING: "読み込み中...",
    REPLY: "返信",
    LIKE: "いいね",
    VIEW: "表示",
    SHARE: "共有",
    SEE_MORE: "もっと見る",

    // Error messages
    ERROR_GENERIC: "エラーが発生しました。もう一度お試しください。",
    ERROR_UNAUTHORIZED: "この操作を実行する権限がありません。",
    ERROR_NOT_FOUND: "リクエストされたリソースが見つかりませんでした。",
    ERROR_INVALID_INPUT: "入力が無効です。データを確認してください。",
    ERROR_NETWORK: "ネットワークエラーです。接続を確認してください。",

    // Success messages
    SUCCESS_SAVED: "保存しました！",
    SUCCESS_DELETED: "削除しました！",
    SUCCESS_UPDATED: "更新しました！",
    SUCCESS_CREATED: "作成しました！",

    // Categories
    CATEGORY_GENERAL: "一般",
    CATEGORY_QUESTION: "質問",
    CATEGORY_DISCUSSION: "ディスカッション",
    CATEGORY_ANNOUNCEMENT: "お知らせ",

    // User roles
    ROLE_ADMIN: "管理者",
    ROLE_USER: "ユーザー",

    // Auth
    LOGIN: "ログイン",
    LOGOUT: "ログアウト",
    REGISTER: "登録",
    EMAIL: "メールアドレス",
    PASSWORD: "パスワード",
    USERNAME: "ユーザー名",
    ALREADY_HAVE_ACCOUNT: "すでにアカウントをお持ちですか？",
    DONT_HAVE_ACCOUNT: "アカウントをお持ちでないですか？",

    // Post
    POST: "投稿",
    POSTS: "投稿一覧",
    NEW_POST: "新規投稿",
    TITLE: "タイトル",
    CONTENT: "内容",
    TAGS: "タグ",
    CATEGORY: "カテゴリー",
    SELECT_CATEGORY: "カテゴリーを選択",
    TAGS_COMMA_SEPARATED: "タグ（カンマ区切り）",
    VIEWS: "閲覧",
    UPDATING_POST: "投稿を更新中...",
    POST_UPDATED_SUCCESS: "投稿を更新しました！",
    FAILED_TO_UPDATE_POST: "投稿の更新に失敗しました",
    FAILED_TO_LOAD_POST: "投稿の読み込みに失敗しました",
    LOGIN_TO_COMMENT: "コメントする",
    NO_COMMENTS_BE_FIRST:
      "まだコメントがありません。最初にコメントしましょう！",
    TITLE_REQUIRED: "タイトルは必須です",
    CONTENT_REQUIRED: "内容は必須です",
    CATEGORY_REQUIRED: "カテゴリーは必須です",

    // Comment
    COMMENT: "コメント",
    COMMENTS: "コメント",
    ADD_COMMENT: "コメントを追加",

    // Profile & Admin
    PROFILE: "プロフィール",
    SETTINGS: "設定",
    AVATAR: "アバター",
    ADMIN_DASHBOARD: "管理者ダッシュボード",
    MANAGE_CATEGORIES_POSTS_USERS: "カテゴリー、投稿、ユーザーを管理",
    ABOUT: "について",
    EDIT_PROFILE: "プロフィールを編集",
    NAME: "名前",
    BIRTHDAY: "誕生日",
    GENDER: "性別",
    MEMBER_SINCE: "登録日",
    JOINED: "参加",
    POINTS: "ポイント",
    LIKES: "いいね",
    NO_POSTS_YET: "まだ投稿がありません",
    BACK_TO_PROFILE: "プロフィールに戻る",
    POSTS_BY: "の投稿",
    POST_SINGULAR: "件の投稿",
    POST_PLURAL: "件の投稿",
    COMMENTS_BY: "のコメント",
    COMMENT_SINGULAR: "件のコメント",
    COMMENT_PLURAL: "件のコメント",
    NO_COMMENTS_YET: "まだコメントがありません",
    LIKES_LABEL: "いいね",
    REPLIES_LABEL: "返信",
    LIKED_CONTENT: "いいねしたコンテンツ",
    LIKED_POSTS: "いいねした投稿",
    LIKED_COMMENTS: "いいねしたコメント",
    NO_LIKED_POSTS: "まだいいねした投稿がありません",
    NO_LIKED_COMMENTS: "まだいいねしたコメントがありません",
    ON: "の",
  },

  cn: {
    // Application info
    APP_NAME: "拳击交流同好会",
    APP_SHORT_NAME: "拳交会",
    APP_DESCRIPTION:
      "拳击交流同好会，一个让拳击爱好者们分享想法和经验的全球社区。",

    // Home page
    HOME_WELCOME: "欢迎来到拳交会",
    HOME_SUBTITLE: "分享您的想法，与他人建立联系",
    HOME_NO_POSTS: "还没有帖子",
    HOME_CREATE_FIRST_POST: "创建第一个帖子",

    // Common actions
    SAVE: "保存",
    CANCEL: "取消",
    DELETE: "删除",
    EDIT: "编辑",
    SUBMIT: "提交",
    LOADING: "加载中...",
    REPLY: "回复",
    LIKE: "点赞",
    VIEW: "查看",
    SHARE: "分享",
    SEE_MORE: "查看更多",

    // Error messages
    ERROR_GENERIC: "出错了，请重试。",
    ERROR_UNAUTHORIZED: "您没有权限执行此操作。",
    ERROR_NOT_FOUND: "未找到请求的资源。",
    ERROR_INVALID_INPUT: "输入无效，请检查您的数据。",
    ERROR_NETWORK: "网络错误，请检查您的连接。",

    // Success messages
    SUCCESS_SAVED: "保存成功！",
    SUCCESS_DELETED: "删除成功！",
    SUCCESS_UPDATED: "更新成功！",
    SUCCESS_CREATED: "创建成功！",

    // Categories
    CATEGORY_GENERAL: "综合",
    CATEGORY_QUESTION: "提问",
    CATEGORY_DISCUSSION: "讨论",
    CATEGORY_ANNOUNCEMENT: "公告",

    // User roles
    ROLE_ADMIN: "管理员",
    ROLE_USER: "用户",

    // Auth
    LOGIN: "登录",
    LOGOUT: "登出",
    REGISTER: "注册",
    EMAIL: "邮箱",
    PASSWORD: "密码",
    USERNAME: "用户名",
    ALREADY_HAVE_ACCOUNT: "已有账号？",
    DONT_HAVE_ACCOUNT: "还没有账号？",

    // Post
    POST: "帖子",
    POSTS: "帖子列表",
    NEW_POST: "新帖子",
    TITLE: "标题",
    CONTENT: "内容",
    TAGS: "标签",
    CATEGORY: "分类",
    SELECT_CATEGORY: "选择分类",
    TAGS_COMMA_SEPARATED: "标签（逗号分隔）",
    VIEWS: "浏览",
    UPDATING_POST: "更新帖子中...",
    POST_UPDATED_SUCCESS: "帖子更新成功！",
    FAILED_TO_UPDATE_POST: "更新帖子失败",
    FAILED_TO_LOAD_POST: "加载帖子失败",
    LOGIN_TO_COMMENT: "评论",
    NO_COMMENTS_BE_FIRST: "还没有评论。成为第一个评论的人！",
    TITLE_REQUIRED: "标题为必填项",
    CONTENT_REQUIRED: "内容为必填项",
    CATEGORY_REQUIRED: "分类为必填项",

    // Comment
    COMMENT: "评论",
    COMMENTS: "评论",
    ADD_COMMENT: "添加评论",

    // Profile & Admin
    PROFILE: "个人资料",
    SETTINGS: "设置",
    AVATAR: "头像",
    ADMIN_DASHBOARD: "管理员控制台",
    MANAGE_CATEGORIES_POSTS_USERS: "管理分类、帖子和用户",
    ABOUT: "关于",
    EDIT_PROFILE: "编辑个人资料",
    NAME: "姓名",
    BIRTHDAY: "生日",
    GENDER: "性别",
    MEMBER_SINCE: "注册时间",
    JOINED: "加入",
    POINTS: "积分",
    LIKES: "点赞",
    NO_POSTS_YET: "还没有帖子",
    BACK_TO_PROFILE: "返回个人资料",
    POSTS_BY: "的帖子",
    POST_SINGULAR: "个帖子",
    POST_PLURAL: "个帖子",
    COMMENTS_BY: "的评论",
    COMMENT_SINGULAR: "条评论",
    COMMENT_PLURAL: "条评论",
    NO_COMMENTS_YET: "还没有评论",
    LIKES_LABEL: "点赞",
    REPLIES_LABEL: "回复",
    LIKED_CONTENT: "点赞的内容",
    LIKED_POSTS: "点赞的帖子",
    LIKED_COMMENTS: "点赞的评论",
    NO_LIKED_POSTS: "还没有点赞的帖子",
    NO_LIKED_COMMENTS: "还没有点赞的评论",
    ON: "在",
  },
} as const;

// Helper function to get translated text
export const t = (
  key: keyof typeof TRANSLATIONS.en,
  lang: Language = "en"
): string => {
  return TRANSLATIONS[lang][key] as string;
};

export type PostCategory = (typeof APP_CONSTANTS.POST_CATEGORIES)[number];
