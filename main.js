// Do your work here...
const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APP";

//generate ID uniq
function generateId() {
  return +new Date();
}
//generate object of books
function generateBooksObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id == bookId) {
      console.log(books)
      return books;
    }
  }
  return -1;
}
/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() {
  if (typeof Storage === undefined) {
    showToast("Browser Anda tidak mendukung local storage", "error");
    return false;
  }
  return true;
}
/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const dataParsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, dataParsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
/**
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel
 */
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    try {
      for (const book of data) {
        books.push(book);
      }
    } catch (error) {
      showToast("Data kosong!", "error");
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
function renderBook(booksToRender = books) {
  const uncompletedBook = document.getElementById("incompleteBookList");
  const completedBook = document.getElementById("completeBookList");

  const uncompleted = booksToRender.filter((book) => !book.isCompleted);
  const complete = booksToRender.filter((book) => book.isCompleted);

  //clear book list
  uncompletedBook.innerHTML = "";
  completedBook.innerHTML = "";

  if (complete.length === 0) {
    completedBook.innerHTML =
      '<div class="empty-shelf">Tidak ada buku yang selesai dibaca</div>';
  } else {
    completedBook.innerHTML = complete
      .map((book) => makeElementBook(book))
      .join("");
  }

  if (uncompleted.length === 0) {
    uncompletedBook.innerHTML =
      '<div class="empty-shelf">Tidak ada buku yang belum selesai dibaca</div>';
  } else {
    uncompletedBook.innerHTML = uncompleted
      .map((book) => makeElementBook(book))
      .join("");
  }
}
function makeElementBook(book) {
  const statusClass = book.isCompleted ? "complete-book" : "incomplete-book";
  const toggleText = book.isCompleted
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  return `
            <div data-bookid="${book.id}" data-testid="bookItem" class="${statusClass}">
                <h3 data-testid="bookItemTitle">${book.title}</h3> 
                <p data-testid="bookItemAuthor">${book.author}</p>
                <p data-testid="bookItemYear">${book.year}</p>
                <div>
                    <button data-testid="bookItemIsCompleteButton" onclick="toggleBookStatus('${book.id}')">
                    ${toggleText}
                    </button>
                    <button data-testid="bookItemDeleteButton" onclick="deleteBook('${book.id}')">
                    Hapus Buku
                    </button>
                    <button data-testid="bookItemEditButton" onclick="openEditModal('${book.id}')">
                    Edit Buku
                    </button>
                </div>
            </div>
        `;
}
//tambah buku
function addBook() {
  const titleText = document.getElementById("bookFormTitle").value;
  const authorText = document.getElementById("bookFormAuthor").value;
  const yearText = document.getElementById("bookFormYear").value;
  const isCompleted = document.getElementById("bookFormIsComplete").checked;
  const generatedId = generateId();
  const bookObject = generateBooksObject(
    generatedId,
    titleText,
    authorText,
    yearText,
    isCompleted
  );
  books.push(bookObject);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}
function toggleBookStatus(bookId) {
  const book = findBook(bookId);
  if (book === null) return;

  book.isCompleted = !book.isCompleted;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
//hapus buku
function deleteBook(bookId) {
  if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
    const book = findBookIndex(bookId);
    if (book === -1) return;
    books.splice(book, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    showToast("Buku terhapus", "success");
  }
}

//update submit based on checkbox
function updateSubmitText() {
  const checkbox = document.getElementById("bookFormIsComplete");
  const submitText = document.getElementById("submitButtonText");
  if (checkbox.checked) {
    submitText.innerText = "Sudah dibaca";
  } else {
    submitText.innerText = "Belum selesai dibaca";
  }
}
//function toast notification
function showToast(message, type = "success", icon = "") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
  };
  //create element toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = ` <span class="toast-icon">${icon || icons[type]}</span>
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>`;
  //add to body
  document.body.appendChild(toast);

  // Animate
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Auto remove 3s
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }
  }, 2000);
}
//Open Modal Edit
function openEditModal(bookId) {
  const book = findBook(bookId);
  if (!book) return;
  currentEditId = bookId;

  document.getElementById("editBookTitle").value = book.title;
  document.getElementById("editBookAuthor").value = book.author;
  document.getElementById("editBookYear").value = book.year;
  document.getElementById("editBookIsCompleted").value = book.isCompleted;
  document.getElementById("editModal").style.display = "block";
}

//Close Modal Edit

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  document.getElementById("editBookForm").reset();
  currentEditId = null;
}
//Edit Book
function editBook(id, title, author, year, isCompleted) {
  const index = books.findIndex((book)=>book.id==id)
  
  if (index !== -1) {
    console.log(index)
    books[index] = {
      id,
      title,
      author,
      year,
      isCompleted,
    };
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

//Search Book
function searchBook(query) {
  if (!query.trim()) {
    document.dispatchEvent(new Event(RENDER_EVENT));
    return;
  }
  const filteredBook = books.filter((book) =>
    book.title.toLowerCase().includes(query.toLowerCase())
  );
  renderBook(filteredBook);
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document
  .getElementById("bookFormIsComplete")
  .addEventListener("change", updateSubmitText);

document.addEventListener(SAVED_EVENT, () => {
  showToast("Data berhasil tersimpan!", "success");
});

document
  .getElementById("editBookForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    
    const title = document.getElementById("editBookTitle").value;
    const author = document.getElementById("editBookAuthor").value;
    const year = document.getElementById("editBookYear").value;
    const isCompleted = document.getElementById("editBookIsCompleted").checked;
    
    if (title || author || year || isCompleted) {
      console.log(currentEditId, title, author, year, isCompleted);
      editBook(currentEditId, title, author, year, isCompleted);
      closeEditModal();
    }
  });
  document.getElementById("searchBook").addEventListener("submit",function(event){
    event.preventDefault();
    const query = document.getElementById("searchBookTitle").value;
    searchBook(query)
  })
document
  .getElementById("searchBookTitle")
  .addEventListener("input", function (event) {
    searchBook(event.target.value);
  });

document.addEventListener(RENDER_EVENT, function () {
  renderBook();
});
