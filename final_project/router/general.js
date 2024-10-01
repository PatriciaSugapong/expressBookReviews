const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password){
    return res.status(404).json({ message: "Username and password are required."});
  }
  
  const existingUser = users.find(user => user.username === username);
  if (existingUser){
    return res.status(409).json({ message: "Username already exists."});
  }

  const newUser = {username, password};
  users.push(newUser);

  return res.status(201).json({ message: "User registered successfully."});
});

// Get the book list available in the shop
function getBooks() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Object.keys(books).length === 0) {
          return reject("No books available");
        }
        resolve(books);
      }, 6000); 
    });
  }
  
  // Call getBooks function and handle the Promise
  public_users.get('/', (req, res) => {
    getBooks()
      .then((bookList) => {
        console.log("Books fetched successfully");
        res.send(bookList);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        res.status(500).send({ message: error });
      });
  });
  
// Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    const getBookByISBN = () => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
  
        if (book) {
          resolve(book);
        } else {
          reject("Book not found");
        }
      });
    };
    
    // Call the promise and handle success/error
    getBookByISBN()
      .then((book) => {
        console.log("Book found");
        res.send(book);
      })
      .catch((error) => {
        console.error("Error fetching book:", error);
        res.status(404).send({ message: error });
      });
  
  });
  
// Get book details based on author using Promises
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;
  
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        let matchedBooks = [];
  
        for (const key in books) {
          if (books[key].author === author) {
            matchedBooks.push(books[key]);
          }
        }
  
        if (matchedBooks.length > 0) {
          resolve(matchedBooks);
        } else {
          reject("No books found by this author");
        }
      });
    };
    
    getBooksByAuthor()
      .then((matchedBooks) => {
        console.log("Books found");
        res.send(matchedBooks);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        res.status(404).send({ message: error });
      });
    });
  

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
  
    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        let filteredBookByTitle = [];
  
        for (const key in books) {
          if (books[key].title.toLowerCase() === title.toLowerCase()) {
            filteredBookByTitle.push(books[key]);
          }
        }
  
        if (filteredBookByTitle.length > 0) {
          resolve(filteredBookByTitle);
        } else {
          reject("No books found by this title");
        }
      });
    };
    
    getBooksByTitle()
      .then((filteredBookByTitle) => {
        console.log("Books found");
        res.send(filteredBookByTitle);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        res.status(404).send({ message: error });
      });
  
  });
  
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]){
        const reviews = books[isbn].reviews;
        
        if (Object.keys(reviews).length === 0) {
            return res.status(200).send({ message: "No reviews available for this book." });
        }
        
        res.send(reviews);
    } else {
        res.status(404).json({ message: "Book not found for this ISBN"});
    }
});





module.exports.general = public_users;
