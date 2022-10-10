# library-app-fullstack-graphql

A full-stack GraphQL library app, front-end written by React, Apollo client and back-end written by Apollo server, using MongoDB database. The UI is implemented by Material UI tools and Fomik for handling forms. The app is deployed on Heroku https://library-app-graphql.herokuapp.com/

## Description

This app has 5 views
* Authors: show all authors in the library and a from that can set the birth year of author after login
* Books: show all the books in the library and can filter the book list by genre
* Add Book: show after login and has a form to add new book, after adding a book successfully, Authors and Books view will update also
* Recommend: show the recommend books by the login user's favorite genre
* Login: login page, you can try to login with username: admin, password: password

## GraphQL Schmea

The GraphQL schmea has 4 Object types: Author, Book, User and Token

Query type with 5 fields: 
* bookCount: return the number of books in the library 
* authorCount: return the number of authors in the library
* allBooks(genre: String): return all books in the library and can query with genre arguments
* allAuthors: return all authors in the library
* me: return the login user

Mutation type with 4 fields: addBook, editAuthor, createUser, login

Subscription with a filed: bookAdded, subscribe to book added event


