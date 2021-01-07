const modal = document.querySelector(".modal");
const addNewBook = document.querySelector(".buttonContainer")
    .querySelector("button");
const submitButton = document.querySelector(".bookForm-button");
let myLibrary = [];

// Event Listeners
addNewBook.addEventListener("click", toggleModal);
submitButton.addEventListener("click", validateInputs);

function Book(title, author, pages, isRead) {
  this.title  = title;
  this.author = author;
  this.pages = pages;
  this.isRead = isRead;
}

Book.prototype.changeReadStatus = function() {
  this.isRead = !this.isRead;
}

function validateInputs(event) {
  event.preventDefault();
  const bookTitle = document.querySelector("#title");
  const bookAuthor = document.querySelector("#author");
  const bookPages = document.querySelector("#pages");
  const isRead = document.querySelector("#isRead");
  let emptyFields = [bookTitle, bookAuthor, bookPages].filter((el) => {
    if (!el.value) el.nextElementSibling.classList.add("show");
    return el.value === '';
  });

  if (emptyFields.length) {
    return;
  } else {
    addBookToLibrary(bookTitle, bookAuthor, bookPages, isRead);
  }
}

function toggleModal() {
  modal.classList.toggle("show");
}

function addBookToLibrary(title, author, pages, isRead) {
  const book = new Book(title.value, author.value, pages.value, isRead.checked);

  myLibrary.push(book);
  updateLocalStorage();
  renderLibrary();
  resetModal(title, author, pages);
}

function resetModal(title, author, pages) {
  title.value = '';
  author.value = '';
  pages.value = '';
  title.nextElementSibling.classList.remove("show");
  author.nextElementSibling.classList.remove("show");
  pages.nextElementSibling.classList.remove("show");
  toggleModal();
}

function renderLibrary() {
  const libraryDiv = document.querySelector(".library");
  libraryDiv.innerHTML = '';

  myLibrary.forEach((book, i) => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("library-bookCard");
    bookCard.setAttribute("data-id", i);
    bookCard.setAttribute("data-isRead", book.isRead);
    bookCard.setAttribute("onchange", "changeReadStatus(event)");
    bookCard.innerHTML = `
        <h1>${book.title}</h1>
        <h2>${book.author}</h2>
        <h3>${book.pages} pages</h3>
        <button
            class="deleteButton"
            onclick="deleteBook(event)">
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

    libraryDiv.appendChild(bookCard);
  });
}

function deleteBook(event) {
  const targetBookCard = event.target.parentElement;
  const bookIndex = targetBookCard.getAttribute("data-id");
  myLibrary.splice(bookIndex, 1);
  updateLocalStorage();
  renderLibrary();
}

function changeReadStatus(event) {
  const delegator = event.currentTarget;
  const dataId = delegator.getAttribute("data-id");
  myLibrary[dataId].changeReadStatus();
  updateLocalStorage();
  renderLibrary();
}

function init() {
  if (!localStorage.getItem("myLibrary")) {
    localStorage.setItem("myLibrary", JSON.stringify([]));
  } else {
    myLibrary = JSON.parse(localStorage.getItem("myLibrary"));
  }

  renderLibrary(myLibrary);
}

function updateLocalStorage() {
  localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
}

init();