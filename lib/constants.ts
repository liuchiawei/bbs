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

    // Admin Management
    POSTS_MANAGEMENT: "Posts Management",
    USERS_MANAGEMENT: "Users Management",
    CATEGORIES_MANAGEMENT: "Categories Management",
    TOTAL: "Total",
    AUTHOR: "Author",
    CREATED: "Created",
    ACTIONS: "Actions",
    NO_POSTS_FOUND: "No posts found",
    FAILED_TO_LOAD_POSTS: "Failed to load posts",
    POST_DELETED_SUCCESS: "Post deleted successfully",
    FAILED_TO_DELETE_POST: "Failed to delete post",
    PREVIOUS: "Previous",
    NEXT: "Next",
    PAGE: "Page",
    OF: "of",
    ARE_YOU_SURE: "Are you sure?",
    DELETE_POST_CONFIRMATION: "This action cannot be undone. This will permanently delete the post and all its comments.",

    // Error messages
    ERROR_GENERIC: "Something went wrong. Please try again.",
    ERROR_UNAUTHORIZED: "You are not authorized to perform this action.",
    ERROR_NOT_FOUND: "The requested resource was not found.",
    ERROR_INVALID_INPUT: "Invalid input. Please check your data.",
    ERROR_NETWORK: "Network error. Please check your connection.",

    // Loading messages
    LOADING_POSTS: "Loading posts...",
    LOADING_COMMENTS: "Loading comments...",
    LOADING_USERS: "Loading users...",
    LOADING_CATEGORIES: "Loading categories...",
    LOADING_PROFILE: "Loading profile...",
    LOADING_ADMIN_DASHBOARD: "Loading admin dashboard...",
    LOADING_ADMIN_CATEGORIES: "Loading admin categories...",
    LOADING_ADMIN_POSTS: "Loading admin posts...",
    LOADING_ADMIN_USERS: "Loading admin users...",

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

    // Register Form
    CREATE_ACCOUNT: "Create an account",
    ENTER_DETAILS_TO_REGISTER: "Enter your details to register",
    USERNAME_PLACEHOLDER: "Max 12 alphanumeric characters",
    USER_ID_TAKEN: "This User ID is already taken",
    USER_ID_AVAILABLE: "User ID is available",
    NAME_LABEL: "Name",
    NICKNAME_LABEL: "Nickname (Optional)",
    CONFIRM_PASSWORD: "Confirm Password",
    PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
    GENDER_OPTIONAL: "Gender (Optional)",
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
    BIRTH_DATE_OPTIONAL: "Birth Date (Optional)",
    CANNOT_BE_CHANGED: "Cannot be changed",
    SELECT_GENDER: "Select gender",

    // Post
    POST: "Post",
    POSTS: "Posts",
    NEW_POST: "New Post",
    TITLE: "Title",
    CONTENT: "Content",
    TAGS: "Tags",
    TAGS_COMMA_SEPARATED: "Tags (comma separated)",
    TAGS_PLACEHOLDER: "e.g. training, match, diet",
    CATEGORY: "Category",
    SELECT_CATEGORY: "Select category",
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
    // Avatar Upload
    AVATAR_UPLOAD: "Upload Avatar",
    AVATAR_UPLOAD_DESCRIPTION: "Upload your avatar image",
    AVATAR_UPLOAD_SUCCESS: "Avatar uploaded successfully!",
    AVATAR_UPLOAD_ERROR: "Failed to upload avatar",
    AVATAR_UPLOAD_SIZE_ERROR: "File size must be less than 5MB",
    AVATAR_UPLOAD_TYPE_ERROR: "Please select an image file",
    AVATAR_CHANGE: "Change Avatar",
    AVATAR_UPLOADING: "Uploading...",
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

    // Admin Management
    POSTS_MANAGEMENT: "投稿管理",
    USERS_MANAGEMENT: "ユーザー管理",
    CATEGORIES_MANAGEMENT: "カテゴリー管理",
    TOTAL: "合計",
    AUTHOR: "投稿者",
    CREATED: "作成日",
    ACTIONS: "操作",
    NO_POSTS_FOUND: "投稿が見つかりません",
    FAILED_TO_LOAD_POSTS: "投稿の読み込みに失敗しました",
    POST_DELETED_SUCCESS: "投稿を削除しました",
    FAILED_TO_DELETE_POST: "投稿の削除に失敗しました",
    PREVIOUS: "前へ",
    NEXT: "次へ",
    PAGE: "ページ",
    OF: "/",
    ARE_YOU_SURE: "本当によろしいですか？",
    DELETE_POST_CONFIRMATION: "この操作は取り消せません。投稿とすべてのコメントが完全に削除されます。",

    // Error messages
    ERROR_GENERIC: "エラーが発生しました。もう一度お試しください。",
    ERROR_UNAUTHORIZED: "この操作を実行する権限がありません。",
    ERROR_NOT_FOUND: "リクエストされたリソースが見つかりませんでした。",
    ERROR_INVALID_INPUT: "入力が無効です。データを確認してください。",
    ERROR_NETWORK: "ネットワークエラーです。接続を確認してください。",

    // Loading messages
    LOADING_POSTS: "投稿を読み込み中...",
    LOADING_COMMENTS: "コメントを読み込み中...",
    LOADING_USERS: "ユーザーを読み込み中...",
    LOADING_CATEGORIES: "カテゴリーを読み込み中...",
    LOADING_PROFILE: "プロフィールを読み込み中...",
    LOADING_ADMIN_DASHBOARD: "管理者ダッシュボードを読み込み中...",
    LOADING_ADMIN_CATEGORIES: "管理者カテゴリーを読み込み中...",
    LOADING_ADMIN_POSTS: "管理者投稿を読み込み中...",
    LOADING_ADMIN_USERS: "管理者ユーザーを読み込み中...",

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

    // Register Form
    CREATE_ACCOUNT: "アカウントを作成",
    ENTER_DETAILS_TO_REGISTER: "登録情報を入力してください",
    USERNAME_PLACEHOLDER: "最大12文字の英数字",
    USER_ID_TAKEN: "このユーザーIDは既に使用されています",
    USER_ID_AVAILABLE: "ユーザーIDは利用可能です",
    NAME_LABEL: "名前",
    NICKNAME_LABEL: "ニックネーム（任意）",
    CONFIRM_PASSWORD: "パスワード確認",
    PASSWORDS_DO_NOT_MATCH: "パスワードが一致しません",
    GENDER_OPTIONAL: "性別（任意）",
    MALE: "男性",
    FEMALE: "女性",
    OTHER: "その他",
    BIRTH_DATE_OPTIONAL: "生年月日（任意）",
    CANNOT_BE_CHANGED: "変更できません",
    SELECT_GENDER: "性別を選択",

    // Post
    POST: "投稿",
    POSTS: "投稿一覧",
    NEW_POST: "新規投稿",
    TITLE: "タイトル",
    CONTENT: "内容",
    TAGS: "タグ",
    TAGS_COMMA_SEPARATED: "タグ（カンマ区切り）",
    TAGS_PLACEHOLDER: "例：トレーニング、試合、ダイエット",
    CATEGORY: "カテゴリー",
    SELECT_CATEGORY: "カテゴリーを選択",
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
    // Avatar Upload
    AVATAR_UPLOAD: "アバターをアップロード",
    AVATAR_UPLOAD_DESCRIPTION: "アバター画像をアップロード",
    AVATAR_UPLOAD_SUCCESS: "アバターをアップロードしました！",
    AVATAR_UPLOAD_ERROR: "アバターのアップロードに失敗しました",
    AVATAR_UPLOAD_SIZE_ERROR: "ファイルサイズは5MB以下にしてください",
    AVATAR_UPLOAD_TYPE_ERROR: "画像ファイルを選択してください",
    AVATAR_CHANGE: "アバターを変更",
    AVATAR_UPLOADING: "アップロード中...",
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

    // Admin Management
    POSTS_MANAGEMENT: "帖子管理",
    USERS_MANAGEMENT: "用户管理",
    CATEGORIES_MANAGEMENT: "分类管理",
    TOTAL: "总计",
    AUTHOR: "作者",
    CREATED: "创建时间",
    ACTIONS: "操作",
    NO_POSTS_FOUND: "未找到帖子",
    FAILED_TO_LOAD_POSTS: "加载帖子失败",
    POST_DELETED_SUCCESS: "帖子删除成功",
    FAILED_TO_DELETE_POST: "删除帖子失败",
    PREVIOUS: "上一页",
    NEXT: "下一页",
    PAGE: "第",
    OF: "页，共",
    ARE_YOU_SURE: "您确定吗？",
    DELETE_POST_CONFIRMATION: "此操作无法撤消。这将永久删除帖子及其所有评论。",

    // Error messages
    ERROR_GENERIC: "出错了，请重试。",
    ERROR_UNAUTHORIZED: "您没有权限执行此操作。",
    ERROR_NOT_FOUND: "未找到请求的资源。",
    ERROR_INVALID_INPUT: "输入无效，请检查您的数据。",
    ERROR_NETWORK: "网络错误，请检查您的连接。",

    // Loading messages
    LOADING_POSTS: "帖子加载中...",
    LOADING_COMMENTS: "评论加载中...",
    LOADING_USERS: "用户加载中...",
    LOADING_CATEGORIES: "分类加载中...",
    LOADING_PROFILE: "个人资料加载中...",
    LOADING_ADMIN_DASHBOARD: "管理员控制台加载中...",
    LOADING_ADMIN_CATEGORIES: "管理员分类加载中...",
    LOADING_ADMIN_POSTS: "管理员帖子加载中...",
    LOADING_ADMIN_USERS: "管理员用户加载中...",

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

    // Register Form
    CREATE_ACCOUNT: "创建账号",
    CANNOT_BE_CHANGED: "无法更改",
    ENTER_DETAILS_TO_REGISTER: "输入您的详细信息以注册",
    USERNAME_PLACEHOLDER: "最多12个字母数字字符",
    USER_ID_TAKEN: "此用户ID已被占用",
    USER_ID_AVAILABLE: "用户ID可用",
    NAME_LABEL: "姓名",
    NICKNAME_LABEL: "昵称（可选）",
    CONFIRM_PASSWORD: "确认密码",
    PASSWORDS_DO_NOT_MATCH: "密码不匹配",
    GENDER_OPTIONAL: "性别（可选）",
    SELECT_GENDER: "选择性别",
    MALE: "男",
    FEMALE: "女",
    OTHER: "其他",
    BIRTH_DATE_OPTIONAL: "出生日期（可选）",

    // Post
    POST: "帖子",
    POSTS: "帖子列表",
    NEW_POST: "新帖子",
    TITLE: "标题",
    CONTENT: "内容",
    TAGS: "标签",
    TAGS_COMMA_SEPARATED: "标签（逗号分隔）",
    TAGS_PLACEHOLDER: "例：训练、比赛、饮食",
    CATEGORY: "分类",
    SELECT_CATEGORY: "选择分类",
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
    // Avatar Upload
    AVATAR_UPLOAD: "上传头像",
    AVATAR_UPLOAD_DESCRIPTION: "上传您的头像图片",
    AVATAR_UPLOAD_SUCCESS: "头像上传成功！",
    AVATAR_UPLOAD_ERROR: "头像上传失败",
    AVATAR_UPLOAD_SIZE_ERROR: "文件大小必须小于5MB",
    AVATAR_UPLOAD_TYPE_ERROR: "请选择一个图片文件",
    AVATAR_CHANGE: "更改头像",
    AVATAR_UPLOADING: "上传中...",
  },
} as const;

// Helper function to get translated text, default to Japanese if no language is provided
export const t = (key: keyof typeof TRANSLATIONS.en, lang?: Language | null): string => {
  return TRANSLATIONS[lang ?? "ja"][key] ?? key;
};

export type PostCategory = (typeof APP_CONSTANTS.POST_CATEGORIES)[number];
