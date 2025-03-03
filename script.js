const firebaseConfig = {
  apiKey: "AIzaSyAUyofevCAM-SijpWdq87av-R5L4XpeX0M",
  authDomain: "budgetplanner-ba99c.firebaseapp.com",
  projectId: "budgetplanner-ba99c",
  storageBucket: "budgetplanner-ba99c.firebasestorage.app",
  messagingSenderId: "353318339490",
  appId: "1:353318339490:web:558aa7d2e53876ab6868fb",
  measurementId: "G-5G5T49QTQB",
};

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const budgetForm = document.getElementById("budget-form");
const budgetList = document.getElementById("budget-list");
const filterButtons = {
  week: document.getElementById("filter-week"),
  month: document.getElementById("filter-month"),
  year: document.getElementById("filter-year"),
  all: document.getElementById("filter-all"),
};
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login");
const signupButton = document.getElementById("signup");
const logoutButton = document.getElementById("logout");
const authStatus = document.getElementById("auth-status");

let currentEditId = null; // Track the ID of the item being edited

// Add or update budget item
budgetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const user = auth.currentUser;

  if (user) {
    try {
      if (currentEditId) {
        // Update existing item
        const docRef = doc(db, "budget", currentEditId);
        await updateDoc(docRef, {
          description,
          amount: parseFloat(amount),
          date,
          category,
        });
        currentEditId = null; // Reset after editing
      } else {
        // Add new item
        await addDoc(collection(db, "budget"), {
          userId: user.uid,
          description,
          amount: parseFloat(amount),
          date,
          category,
        });
      }
      budgetForm.reset();
    } catch (error) {
      console.error("Error adding/updating document: ", error);
    }
  } else {
    authStatus.textContent = "Please log in to add items.";
  }
});

// Filter logic
function filterItems(items, filterType) {
  const now = new Date();
  return items.filter((item) => {
    const itemDate = new Date(item.date);
    switch (filterType) {
      case "week":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return itemDate >= startOfWeek;
      case "month":
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      case "year":
        return itemDate.getFullYear() === now.getFullYear();
      case "all":
      default:
        return true;
    }
  });
}

// Render budget items grouped by category with totals
function renderBudgetItemsGrouped(snapshot, filterType = "all") {
  const categories = {};

  // Group documents by category and calculate totals
  const items = snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));
  const filteredItems = filterItems(items, filterType);

  filteredItems.forEach((data) => {
    if (!categories[data.category]) {
      categories[data.category] = { items: [], total: 0 };
    }
    categories[data.category].items.push(data);
    categories[data.category].total += data.amount;
  });

  // Clear the list
  budgetList.innerHTML = "";

  // Render each category and its items
  for (const [category, { items, total }] of Object.entries(categories)) {
    const categoryDiv = document.createElement("div");
    const categoryTitle = document.createElement("h2");
    categoryTitle.textContent = `${category} - Total: $${total.toFixed(2)}`;
    categoryDiv.appendChild(categoryTitle);

    items.forEach((item) => {
      const li = document.createElement("li");
      const desc = document.createElement("span");
      const amt = document.createElement("span");
      const date = document.createElement("span");
      const delBtn = document.createElement("button");
      const editBtn = document.createElement("button");

      desc.textContent = `Description: ${item.description}`;
      amt.textContent = `Amount: $${item.amount.toFixed(2)}`;
      date.textContent = `Date: ${item.date}`;
      delBtn.textContent = "Delete";
      editBtn.textContent = "Edit";
        editBtn.style.backgroundColor = "#525252";
      li.appendChild(desc);
      li.appendChild(amt);
      li.appendChild(date);
      li.appendChild(delBtn);
      li.appendChild(editBtn);

      categoryDiv.appendChild(li);

      // Delete budget item with confirmation
      delBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmDelete = confirm(
          "Are you sure you want to delete this item?"
        );
        if (confirmDelete) {
          try {
            const docRef = doc(db, "budget", item.id);
            await deleteDoc(docRef);
            console.log("Document successfully deleted!");
          } catch (error) {
            console.error("Error removing document: ", error);
          }
        }
      });

      // Edit budget item
      editBtn.addEventListener("click", () => {
        // Populate form with existing data
        document.getElementById("description").value = item.description;
        document.getElementById("amount").value = item.amount;
        document.getElementById("date").value = item.date;
        document.getElementById("category").value = item.category;
        currentEditId = item.id; // Set current edit ID
      });
    });

    budgetList.appendChild(categoryDiv);
  }
}

// Real-time listener for authenticated user
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userBudgetQuery = query(
      collection(db, "budget"),
      where("userId", "==", user.uid)
    );
    onSnapshot(userBudgetQuery, (snapshot) => {
      renderBudgetItemsGrouped(snapshot);
    });
  } else {
    budgetList.innerHTML = "<p>Please log in to view your budget items.</p>";
  }
});

// Add event listeners for filter buttons
Object.entries(filterButtons).forEach(([filterType, button]) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons
    Object.values(filterButtons).forEach((btn) =>
      btn.classList.remove("active")
    );
    // Add active class to the clicked button
    button.classList.add("active");

    const user = auth.currentUser;
    if (user) {
      const userBudgetQuery = query(
        collection(db, "budget"),
        where("userId", "==", user.uid)
      );
      onSnapshot(userBudgetQuery, (snapshot) => {
        renderBudgetItemsGrouped(snapshot, filterType);
      });
    }
  });
});

// Login function
loginButton.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    authStatus.textContent = "Login successful!";
    showApp();
  } catch (error) {
    authStatus.textContent = `Error: ${error.message}`;
  }
});

// Sign up function
signupButton.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    authStatus.textContent = "Sign up successful!";
    showApp();
  } catch (error) {
    authStatus.textContent = `Error: ${error.message}`;
  }
});

// Logout function
logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    emailInput.value = "";
    passwordInput.value = "";
    authStatus.textContent = "Logged out successfully!";
    showAuth();
  } catch (error) {
    authStatus.textContent = `Error: ${error.message}`;
  }
});

// Show app function
function showApp() {
  authContainer.style.display = "none";
  appContainer.style.display = "block";
}

// Show auth function
function showAuth() {
  authContainer.style.display = "block";
  appContainer.style.display = "none";
}

// Check authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    showApp();
  } else {
    showAuth();
  }
});
