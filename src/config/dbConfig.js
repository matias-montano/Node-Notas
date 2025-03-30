const dbConfig = {
  url: process.env.DATABASE_URL || 'mongodb://mongo:27017/todo-app'
};

export default dbConfig;