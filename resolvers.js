const { UserInputError, AuthenticationError } = require('apollo-server')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const JWT_SECRET = 'SECRET'

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if(args.genre){
        return Book.find({ genres: { $in: [args.genre] } }).populate('author')
      }
      return Book.find({}).populate('author')
    },
    allAuthors: async () => {
      return Author.find({})
    },
    me: (root, args, context ) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if(!context.currentUser){
        throw new AuthenticationError("not authenticated")
      }

      let author = await Author.findOne({ name: args.author })
      if(!author){
        author = new Author({ name: args.author })
        try{
          await author.save()
        }catch(err){
          throw new UserInputError('invalid author name')
        }
      }
      const book = new Book({ title: args.title, published: args.published, genres: args.genres, author: author._id })

      try{
        await book.save()
        author.bookCount ++
        await author.save()
      }catch(err){
        throw new UserInputError('invalid book infomation')
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author') })

      return book.populate('author')
    },
  editAuthor: async (root, args, context) => {
    if(!context.currentUser){
      throw new AuthenticationError("not authenticated")
    }

    let author = await Author.findOne({ name: args.name })
    if(!author) return null

    author.born = args.setBornTo
    try{
      await author.save()
    }catch(err){
      throw new UserInputError(err.message, {
      invalidArgs: args
    })}

    return author  
  },
  createUser: async (root, args) => {
    const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

    try{
      await user.save()
    }catch(err){
      throw new UserInputError(err.message, {
      invalidArgs: args
    })}

    return user
  },
  login: async (root, args) => {
    const user = await User.findOne({ username: args.username })
    if(!user || args.password !== 'password'){
      throw new UserInputError('wrong username or password')
    }
    const token = jwt.sign({
      username: user.username,
      id: user._id
    }, JWT_SECRET)

    return { value: token }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

module.exports = resolvers