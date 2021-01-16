(function() {
  "use strict";

  function Book({ title, author, pages, isRead }) {
    this.title  = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
  }

  Book.prototype.changeReadStatus = function() {
    this.isRead = !this.isRead;
  }

  const utils = {
    store: function(store) {
      if (store === "localStorage") {
        return function() {
          localStorage.setItem("myLibrary", JSON.stringify(this.library));
        }
      } else {
        return function() {
          App.docRef.set({
            library: JSON.stringify(App.library)
          }).then(function() {
            console.log("Status saved successfully");
          }).catch(function(error) {
            console.log("Got an error: ", error);
          });
        }
      }
    }
  };

  const App = {
    bindEvents: function() {
      document.querySelector(".storageModal")
          .addEventListener("click", this.init.bind(this));
      document.querySelector(".bookForm-button")
          .addEventListener("click", this.validateInputs.bind(this));
      document.querySelector(".buttonContainer")
          .querySelector("button")
          .addEventListener("click", this.toggleModal.bind(this));
    },
    init: function(event) {
      const storageModal = document.querySelector(".storageModal");
      const buttonValue = event.target.classList.value;

      if (buttonValue !== "localStorage" && buttonValue !== "cloud") {
        return;
      }

      if (buttonValue === "localStorage") {
        this.library = this.getLocalStorage();
        this.updateStore = utils.store(buttonValue);
        this.renderLibrary();
      } else {
        this.getFirestore();
        this.updateStore = utils.store(buttonValue);
      }

      storageModal.classList.remove("show");
    },
    getLocalStorage: function() {
      const data = (localStorage.getItem("myLibrary")) ?
          JSON.parse(localStorage.getItem("myLibrary")) :
          [];
      return this.createLibrary(data);
    },
    getFirestore: function() {
      // Firebase
      // Your web app's Firebase configuration
      const firebaseConfig = {
        apiKey: "AIzaSyCRgX5ukGq4O41QNoFaOAUB1R1bWjpykn8",
        authDomain: "library-48350.firebaseapp.com",
        databaseURL: "https://library-48350-default-rtdb.firebaseio.com",
        projectId: "library-48350",
        storageBucket: "library-48350.appspot.com",
        messagingSenderId: "897592554488",
        appId: "1:897592554488:web:d5bc5d52bb7d90246b5c0d",
        measurementId: "G-M1594WY48L"
      };

      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      const firestore = firebase.firestore();
      // alternative to firestore.collection("samples").doc("libraryData")
      this.docRef = firestore.doc("samples/libraryData");

      this.docRef.get().then(documentSnapshot => {
        if (documentSnapshot && documentSnapshot.exists) {
          const myData = documentSnapshot.data();
          this.library = this.createLibrary(JSON.parse(myData.library));
          this.renderLibrary();
        }
      }, this).catch(function(error) {
        console.log("Got an error: ", error);
      });


    },
    createLibrary: function(data) {
      // JSON.stringify only returns enumerable properties, i.e. prototype
      // properties will not be preserved.
      const libraryArray = data.map(book => new Book(book));
      return libraryArray;
    },
    validateInputs: function(event) {
      // Prevents default form submit behavior
      event.preventDefault();
      const title = document.querySelector("#title");
      const author = document.querySelector("#author");
      const pages = document.querySelector("#pages");
      const isRead = document.querySelector("#isRead");
      let emptyFields = [title, author, pages].filter((el) => {
        if (!el.value) el.nextElementSibling.classList.add("show");
        return el.value === '';
      });
  
      if (emptyFields.length) {
        return;
      } else {
        this.addBookToLibrary(title.value, author.value, pages.value, isRead.checked);
        this.resetModal(title, author, pages);
      }
    },
    addBookToLibrary: function(title, author, pages, isRead) {
      const book = new Book({ title, author, pages, isRead });
  
      this.library.push(book);
      this.renderLibrary();
    },
    resetModal: function(title, author, pages) {
      title.value = '';
      author.value = '';
      pages.value = '';
      title.nextElementSibling.classList.remove("show");
      author.nextElementSibling.classList.remove("show");
      pages.nextElementSibling.classList.remove("show");
      this.toggleModal();
    },
    toggleModal: function() {
      const modal = document.querySelector(".modal");
      modal.classList.toggle("show");
    },
    renderLibrary: function() {
      const libraryDiv = document.querySelector(".library");
      libraryDiv.innerHTML = '';

      if (this.library) {
        this.library.forEach((book, i) => {
          const bookCard = document.createElement("div");
          bookCard.classList.add("library-bookCard");
          bookCard.setAttribute("data-id", i);
          bookCard.setAttribute("data-isRead", book.isRead);
          bookCard.innerHTML = `
              <h1>${book.title}</h1>
              <h2>${book.author}</h2>
              <h3>${book.pages} pages</h3>
              <button class="deleteButton">
                Delete
              </button>
              <div class="checkboxContainer">
              <span class=checkboxSpan>Read</span>
                <label class="checkboxLabel" for="readStatus">
                <input
                    id="readStatus"
                    name="readStatus"
                    type="checkbox"
                    value="isRead" />

                </label>
              </div>
          `;

          if (book.isRead) {
            const checkbox = bookCard.querySelector("input[type='checkbox']");
            checkbox.checked = true;
          }

          bookCard.addEventListener("change", this.changeReadStatus.bind(this));
          bookCard
              .querySelector(".deleteButton")
              .addEventListener("click", this.deleteBook.bind(this));

          libraryDiv.appendChild(bookCard);
        });
      }

      this.updateStore();
    },
    deleteBook: function(event) {
      const targetBookCard = event.target.parentElement;
      const bookIndex = targetBookCard.getAttribute("data-id");
      this.library.splice(bookIndex, 1);
      this.renderLibrary();
    },
    changeReadStatus: function(event) {
      const bookCard = event.currentTarget;
      const dataId = bookCard.getAttribute("data-id");
      this.library[dataId].changeReadStatus();
      this.renderLibrary();
    },
  }

  App.bindEvents();
})();