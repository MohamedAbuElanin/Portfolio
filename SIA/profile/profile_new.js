/* ============================================================
  SIA Profile Page - Complete Rebuild
  ============================================================
  
  Features:
  - Profile picture with default avatar (Male.svg/Female.svg)
  - Test sections (Holland & Big Five) with start/view buttons
  - Deterministic Career Analysis (Holland + Big Five mapping)
  - Activity Log
  - Edit Profile
  - Upload Photo
  - Export PDF
  - Logout
  ============================================================ */

// Import Firebase services
import { auth, db, storage } from "../firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { ResultsEngine } from "../js/results_engine.js";

// State Management
const ProfileState = {
  user: null,
  userData: null,
  testResults: null,
  activityLogs: [],
  listeners: [],
  engine: new ResultsEngine(),
};

// DOM Elements
const Elements = {
  loadingIndicator: document.getElementById("profileLoadingIndicator"),
  errorMessage: document.getElementById("profileErrorMessage"),
  profileContent: document.getElementById("profileContent"),
  profilePicture: document.getElementById("profilePicture"),
  uploadPhotoBtn: document.getElementById("uploadPhotoBtn"),
  photoInput: document.getElementById("photoInput"),
  profileUserName: document.getElementById("profileUserName"),
  profileUserEmail: document.getElementById("profileUserEmail"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  exportPDFBtn: document.getElementById("exportPDFBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  hollandTestCard: document.getElementById("hollandTestCard"),
  startHollandBtn: document.getElementById("startHollandBtn"),
  viewHollandBtn: document.getElementById("viewHollandBtn"),
  hollandTestStatus: document.getElementById("hollandTestStatus"),
  bigFiveTestCard: document.getElementById("bigFiveTestCard"),
  startBigFiveBtn: document.getElementById("startBigFiveBtn"),
  viewBigFiveBtn: document.getElementById("viewBigFiveBtn"),
  bigFiveTestStatus: document.getElementById("bigFiveTestStatus"),
  activityLogList: document.getElementById("activityLogList"),
  editProfileModal: new bootstrap.Modal(
    document.getElementById("editProfileModal")
  ),
  editProfileForm: document.getElementById("editProfileForm"),
  editName: document.getElementById("editName"),
  editEmail: document.getElementById("editEmail"),
  editAge: document.getElementById("editAge"),
  editGender: document.getElementById("editGender"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  finalAnalysisSection: document.getElementById("final-analysis-section"),
  finalCareerTitle: document.getElementById("finalCareerTitle"),
  finalAnalysisText: document.getElementById("finalAnalysisText"),
  finalCoursesList: document.getElementById("finalCoursesList"),
  finalBooksList: document.getElementById("finalBooksList"),
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Wait for auth state
  if (typeof window.onAuthStateReady === "undefined") {
    setTimeout(
      () => document.dispatchEvent(new Event("DOMContentLoaded")),
      100
    );
    return;
  }

  window.onAuthStateReady(async (user) => {
    if (!user) {
      window.location.href = "../sign in/signin.html";
      return;
    }

    ProfileState.user = user;
    await ProfileState.engine.init();
    await initializeProfile();
  });
});

// Initialize Profile
async function initializeProfile() {
  try {
    showLoading();

    // The system must rely ONLY on Dummy JSON + Firebase.
    console.log("[Profile] 🔄 Loading profile data from Firestore...");
    await loadProfileData();

    await loadTestResults();
    await loadActivityLogs();
    setupEventListeners();
    setupRealtimeListeners();
    hideLoading();
    Elements.profileContent.style.display = "block";
  } catch (error) {
    console.error("[Profile] Initialization error:", error);
    showError("فشل تحميل الملف الشخصي. يرجى تحديث الصفحة.");
    try {
      await loadProfileData();
      Elements.profileContent.style.display = "block";
    } catch (fallbackError) {
      console.error("[Profile] Fallback also failed:", fallbackError);
    }
  }
}



// Load Profile Data
async function loadProfileData() {
  try {
    const userDoc = await getDoc(doc(db, "users", ProfileState.user.uid));

    if (userDoc.exists()) {
      ProfileState.userData = userDoc.data();
    } else {
      // Create user document if it doesn't exist
      const newUserData = {
        name: ProfileState.user.displayName || "",
        email: ProfileState.user.email || "",
        photoURL: ProfileState.user.photoURL || "",
        gender: null,
        age: null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(doc(db, "users", ProfileState.user.uid), newUserData);
      ProfileState.userData = newUserData;
    }

    // Set default avatar if no photo
    if (!ProfileState.userData.photoURL && !ProfileState.user.photoURL) {
      const gender = ProfileState.userData.gender || "male"; // Default to male
      ProfileState.userData.photoURL =
        gender === "female"
          ? "../Images/Profile Photo/SVG/Female.svg"
          : "../Images/Profile Photo/SVG/Male.svg";
    }

    renderProfileHeader();
  } catch (error) {
    console.error("[Profile] Error loading profile data:", error);
    throw error;
  }
}

// Load Test Results (initial snapshot)
async function loadTestResults() {
  try {
    const testResultsDoc = await getDoc(
      doc(db, "tests_results", ProfileState.user.uid)
    );

    if (testResultsDoc.exists()) {
      const data = testResultsDoc.data();
      ProfileState.testResults = data;

      // Strict Check: tests_results/{uid}.[testType].completed === true
      const hollandCompleted = data.holland?.completed === true;
      const bigFiveCompleted = data.bigFive?.completed === true;

      updateTestButtonsUI({
        hollandCompleted,
        bigFiveCompleted,
      });

      renderTestSections();
    } else {
      // No test results yet
      updateTestButtonsUI({
        hollandCompleted: false,
        bigFiveCompleted: false,
      });
      renderTestSections();
    }
  } catch (error) {
    console.error("[Profile] Error loading test results:", error);
  }
}

// Load Activity Logs
async function loadActivityLogs() {
  try {
    const activityRef = collection(
      db,
      "users",
      ProfileState.user.uid,
      "activityLogs"
    );
    const q = query(activityRef, orderBy("timestamp", "desc"), limit(20));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        ProfileState.activityLogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        renderActivityLog();
      },
      (error) => {
        console.error("[Profile] Activity log error:", error);
      }
    );

    ProfileState.listeners.push(unsubscribe);
  } catch (error) {
    console.error("[Profile] Error loading activity logs:", error);
  }
}

// Render Profile Header
function renderProfileHeader() {
  if (!ProfileState.userData) return;

  // Profile Picture
  Elements.profilePicture.src =
    ProfileState.userData.photoURL ||
    ProfileState.user.photoURL ||
    "../Images/Profile Photo/SVG/Male.svg";

  // Name
  Elements.profileUserName.textContent =
    ProfileState.userData.name || ProfileState.user.displayName || "مستخدم SIA";

  // Email
  Elements.profileUserEmail.textContent =
    ProfileState.userData.email || ProfileState.user.email || "";
}

// Render Test Sections
function renderTestSections() {
  const data = ProfileState.testResults || {};
  const hollandCompleted = data.holland?.completed === true;
  const bigFiveCompleted = data.bigFive?.completed === true;

  // Update buttons based on completion flags
  updateTestButtonsUI({ hollandCompleted, bigFiveCompleted });

  // Update status cards for UX
  if (hollandCompleted) {
    Elements.hollandTestStatus.innerHTML =
      '<span class="text-success"><i class="fas fa-check-circle me-2"></i>مكتمل</span>';
    Elements.hollandTestStatus.className = "test-status completed";
  } else {
    Elements.hollandTestStatus.innerHTML =
      '<span class="text-warning"><i class="fas fa-clock me-2"></i>لم يبدأ</span>';
    Elements.hollandTestStatus.className = "test-status pending";
  }

  if (bigFiveCompleted) {
    Elements.bigFiveTestStatus.innerHTML =
      '<span class="text-success"><i class="fas fa-check-circle me-2"></i>مكتمل</span>';
    Elements.bigFiveTestStatus.className = "test-status completed";
  } else {
    Elements.bigFiveTestStatus.innerHTML =
      '<span class="text-warning"><i class="fas fa-clock me-2"></i>لم يبدأ</span>';
    Elements.bigFiveTestStatus.className = "test-status pending";
  }

  // Trigger Final Analysis if both completed
  if (hollandCompleted && bigFiveCompleted) {
    renderFinalAnalysis();
  } else if (Elements.finalAnalysisSection) {
    Elements.finalAnalysisSection.style.display = "none";
  }
}

// Render Final Analysis
function renderFinalAnalysis() {
  if (!ProfileState.testResults || !Elements.finalAnalysisSection) return;

  const hScores = ProfileState.testResults.holland.scores;
  const b5Scores = ProfileState.testResults.bigFive.scores;

  const analysis = ProfileState.engine.generateFinalAnalysis(hScores, b5Scores);

  Elements.finalCareerTitle.textContent = analysis.career.title;
  
  // Format the analysis text for display (convert newlines to <br>)
  // Using more semantic formatting for the professional look
  const formattedText = analysis.analysisText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/### (.*?)\n/g, '<h5 class="mt-4 mb-2">$1</h5>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
    
  const textContainer = document.querySelector('.career-description-container');
  if (textContainer) {
    textContainer.innerHTML = formattedText;
  }

  // Render Courses
  Elements.finalCoursesList.innerHTML = analysis.career.courses
    .map((course) => `<li class="roadmap-step">${course}</li>`)
    .join("");

  // Render Books
  Elements.finalBooksList.innerHTML = analysis.career.books
    .map((book) => `<li class="roadmap-step">${book}</li>`)
    .join("");

  Elements.finalAnalysisSection.style.display = "block";
}

// Update test buttons UI based on Firestore flags (single source of truth)
function updateTestButtonsUI(data) {
  const hollandCompleted = !!data.hollandCompleted;
  const bigFiveCompleted = !!data.bigFiveCompleted;

  toggleButtonVisibility(Elements.startHollandBtn, !hollandCompleted);
  toggleButtonVisibility(Elements.viewHollandBtn, hollandCompleted);

  toggleButtonVisibility(Elements.startBigFiveBtn, !bigFiveCompleted);
  toggleButtonVisibility(Elements.viewBigFiveBtn, bigFiveCompleted);

  // Optionally disable buttons after completion to prevent retake
  if (hollandCompleted && Elements.startHollandBtn) {
    Elements.startHollandBtn.disabled = true;
  }
  if (bigFiveCompleted && Elements.startBigFiveBtn) {
    Elements.startBigFiveBtn.disabled = true;
  }
}

function toggleButtonVisibility(buttonEl, shouldShow) {
  if (!buttonEl) return;
  buttonEl.style.display = shouldShow ? "block" : "none";
}


// Render Activity Log
function renderActivityLog() {
  if (!ProfileState.activityLogs || ProfileState.activityLogs.length === 0) {
    Elements.activityLogList.innerHTML =
      '<p class="profile-empty-text text-center py-4">لا يوجد نشاط حتى الآن</p>';
    return;
  }

  Elements.activityLogList.innerHTML = ProfileState.activityLogs
    .map((activity) => {
      const timestamp = activity.timestamp?.toDate
        ? activity.timestamp.toDate()
        : new Date(activity.timestamp);
      const timeAgo = getTimeAgo(timestamp);

      let icon = "fa-circle";
      if (
        activity.action?.includes("test") ||
        activity.action?.includes("Test")
      ) {
        icon = "fa-clipboard-check";
      } else if (
        activity.action?.includes("login") ||
        activity.action?.includes("Login")
      ) {
        icon = "fa-sign-in-alt";
      } else if (
        activity.action?.includes("profile") ||
        activity.action?.includes("Profile")
      ) {
        icon = "fa-user-edit";
      }

      return `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-action">${
                      activity.action || activity.activityType || "نشاط"
                    }</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            </li>
        `;
    })
    .join("");
}

// Get Time Ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString();
}

// Setup Event Listeners
function setupEventListeners() {
  // Upload Photo
  Elements.uploadPhotoBtn.addEventListener("click", () =>
    Elements.photoInput.click()
  );
  Elements.photoInput.addEventListener("change", handlePhotoUpload);

  // Edit Profile
  Elements.editProfileBtn.addEventListener("click", openEditModal);
  Elements.saveProfileBtn.addEventListener("click", saveProfile);

  // Export PDF
  Elements.exportPDFBtn.addEventListener("click", exportPDF);

  // Logout
  Elements.logoutBtn.addEventListener("click", handleLogout);

  // Test Buttons
  Elements.startHollandBtn.addEventListener("click", () =>
    startTest("Holland")
  );
  Elements.viewHollandBtn.addEventListener("click", () =>
    viewTestResults("Holland")
  );
  Elements.startBigFiveBtn.addEventListener("click", () =>
    startTest("Big-Five")
  );
  Elements.viewBigFiveBtn.addEventListener("click", () =>
    viewTestResults("Big-Five")
  );
}

// Handle Photo Upload
async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    showLoading();
    const storageRef = ref(
      storage,
      `profile-photos/${ProfileState.user.uid}/${Date.now()}_${file.name}`
    );
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);

    // Update Firebase Auth profile
    await updateProfile(ProfileState.user, { photoURL });

    // Update Firestore
    await updateDoc(doc(db, "users", ProfileState.user.uid), {
      photoURL: photoURL,
      updatedAt: serverTimestamp(),
    });

    // Update UI
    Elements.profilePicture.src = photoURL;
    ProfileState.userData.photoURL = photoURL;

    // Log activity
    await logActivity("تم تحديث صورة الملف الشخصي");

    hideLoading();
    alert("تم تحميل الصورة بنجاح!");
  } catch (error) {
    console.error("[Profile] Error uploading photo:", error);
    hideLoading();
    alert("فشل تحميل الصورة. يرجى المحاولة مرة أخرى.");
  }
}

// Open Edit Modal
function openEditModal() {
  Elements.editName.value = ProfileState.userData.name || "";
  Elements.editEmail.value = ProfileState.userData.email || "";
  Elements.editAge.value = ProfileState.userData.age || "";
  Elements.editGender.value = ProfileState.userData.gender || "";
  Elements.editProfileModal.show();
}

// Save Profile
async function saveProfile() {
  try {
    const updates = {
      name: Elements.editName.value,
      age: Elements.editAge.value ? parseInt(Elements.editAge.value) : null,
      gender: Elements.editGender.value || null,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, "users", ProfileState.user.uid), updates);

    // Update Firebase Auth display name
    if (updates.name) {
      await updateProfile(ProfileState.user, { displayName: updates.name });
    }

    // Update state
    ProfileState.userData = { ...ProfileState.userData, ...updates };

    // Update default avatar if gender changed
    if (
      updates.gender &&
      !ProfileState.userData.photoURL &&
      !ProfileState.user.photoURL
    ) {
      const photoURL =
        updates.gender === "female"
          ? "../Images/Profile Photo/SVG/Female.svg"
          : "../Images/Profile Photo/SVG/Male.svg";
      await updateDoc(doc(db, "users", ProfileState.user.uid), { photoURL });
      Elements.profilePicture.src = photoURL;
    }

    renderProfileHeader();
    Elements.editProfileModal.hide();

    // Log activity
    await logActivity("تم تحديث الملف الشخصي");

    alert("تم تحديث الملف الشخصي بنجاح!");
  } catch (error) {
    console.error("[Profile] Error saving profile:", error);
    alert("فشل حفظ الملف الشخصي. يرجى المحاولة مرة أخرى.");
  }
}

// Export PDF
async function exportPDF() {
  try {
    if (!ProfileState.testResults) {
      alert("الرجاء إكمال الاختبارات أولاً للحصول على تقرير شامل.");
      return;
    }

    showLoading();

    // 1. Populate Template
    const template = document.getElementById("pdfExportTemplate");
    const now = new Date();
    
    document.getElementById("pdfUserName").textContent = `الاسم: ${ProfileState.userData?.name || ProfileState.user.displayName || "مستخدم SIA"}`;
    document.getElementById("pdfDate").textContent = `التاريخ: ${now.toLocaleDateString('ar-EG')}`;

    // Holland Results (Simplified block layout)
    const hollandResults = document.getElementById("pdfHollandResults");
    const hScores = ProfileState.testResults.holland?.scores || {};
    const hollandMap = {
      R: "واقعي", I: "بحثي", A: "فني", S: "اجتماعي", E: "مبادر", C: "تقليدي"
    };
    
    hollandResults.innerHTML = Object.entries(hScores)
      .map(([code, score]) => `
        <div style="display: inline-block; width: 30%; border: 1px solid #ddd; padding: 15px 5px; margin: 5px; text-align: center; border-radius: 8px;">
          <div style="font-weight: bold; color: #c9a01b; margin-bottom: 5px; font-size: 16px;">${hollandMap[code] || code}</div>
          <div style="font-size: 20px; font-weight: bold; color: #333;">${score}%</div>
        </div>
      `).join("");

    // Big Five Results
    const bigFiveResults = document.getElementById("pdfBigFiveResults");
    const bScores = ProfileState.testResults.bigFive?.scores || {};
    const bFiveMap = {
      neuroticism: "العصابية", extraversion: "الانبساط", openness: "الانفتاح", agreeableness: "المقبولية", conscientiousness: "اليقظة"
    };
    
    bigFiveResults.innerHTML = Object.entries(bScores)
      .map(([trait, score]) => `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #f9f9f9; padding-bottom: 10px;">
          <div style="overflow: hidden; margin-bottom: 8px;">
            <span style="float: right; font-weight: bold;">${bFiveMap[trait] || trait}</span>
            <span style="float: left; color: #c9a01b; font-weight: bold;">${score}%</span>
          </div>
          <div style="width: 100%; height: 12px; background: #f0f0f0; border-radius: 6px; overflow: hidden; clear: both;">
            <div style="width: ${score}%; height: 100%; background: #D4AF37; border-radius: 6px;"></div>
          </div>
        </div>
      `).join("");

    // Career Analysis
    const analysis = ProfileState.engine.generateFinalAnalysis(hScores, bScores);
    document.getElementById("pdfCareerTitle").textContent = analysis.career.title;
    document.getElementById("pdfFinalAnalysis").innerHTML = analysis.analysisText
      .replace(/\*\*(.*?)\*\*/g, '<b style="color: #000;">$1</b>')
      .replace(/### (.*?)\n/g, '<h4 style="color: #c9a01b; margin-top: 25px; margin-bottom: 12px; font-size: 18px; border-right: 4px solid #D4AF37; padding-right: 10px;">$1</h4>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    // 2. Export with Rendering Delay
    template.style.display = "block"; // Momentarily show for capture
    
    // Crucial for script/font loading
    await new Promise(resolve => setTimeout(resolve, 600));

    const opt = {
      margin: [0.4, 0.4, 0.4, 0.4],
      filename: `SIA_Report_${ProfileState.userData?.name || "User"}.pdf`,
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: { 
        scale: 3, // Increased scale for sharpness
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        logging: false
      },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait", compress: true },
    };

    const worker = html2pdf().set(opt).from(template);
    await worker.save();

    template.style.display = "none"; // Hide back
    hideLoading();

    await logActivity("تم تصدير تقرير مهني شامل كملف PDF");
  } catch (error) {
    console.error("[Profile] Error exporting PDF:", error);
    const template = document.getElementById("pdfExportTemplate");
    if(template) template.style.display = "none";
    hideLoading();
    alert("حدث خطأ أثناء تصدير التقرير. يرجى المحاولة مرة أخرى.");
  }
}

// Handle Logout
async function handleLogout() {
  if (!confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟")) return;

  try {
    await signOut(auth);
    window.location.href = "../sign in/signin.html";
  } catch (error) {
    console.error("[Profile] Error logging out:", error);
    alert("فشل تسجيل الخروج. يرجى المحاولة مرة أخرى.");
  }
}

// Start Test
function startTest(testType) {
  window.location.href = `../Test/Test.html?test=${testType}`;
}

// View Test Results
function viewTestResults(testType) {
  const resultsURL = (testType === 'Big-Five')
    ? "personality-results.html"
    : "career-results.html";
  window.location.href = resultsURL;
}

// Setup Realtime Listeners
function setupRealtimeListeners() {
  console.log("[Profile] Setting up real-time listeners...");

  // 1. User Profile Listener (AI Status + User Info)
  const userUnsubscribe = onSnapshot(
    doc(db, "users", ProfileState.user.uid),
    (snapshot) => {
      if (!snapshot.exists()) return;

      const profile = snapshot.data();
      console.log("[Profile] User document update received.");
      ProfileState.userData = profile;
      renderProfileHeader();

      // No AI status monitoring needed in the new system
    },
    (error) => {
      console.error("[Profile] User profile listener error:", error);
    }
  );

  // 2. Test Results Listener (Single Source of Truth for Buttons + Trigger)
  // Listens strictly to tests_results/{uid}
  const testResultsUnsubscribe = onSnapshot(
    doc(db, "tests_results", ProfileState.user.uid),
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      ProfileState.testResults = data;

      // Strict Check: tests_results/{uid}.[testType].completed === true
      const hollandCompleted = data.holland?.completed === true;
      const bigFiveCompleted = data.bigFive?.completed === true;

      console.log(
        `[Profile] Real-time Update: Holland=${hollandCompleted}, BigFive=${bigFiveCompleted}`
      );

      // Update UI instantly
      updateTestButtonsUI({ hollandCompleted, bigFiveCompleted });
      renderTestSections();

    },
    (error) => {
      console.error("[Profile] Test results listener error:", error);
    }
  );

  ProfileState.listeners.push(userUnsubscribe, testResultsUnsubscribe);
}

// Log Activity
async function logActivity(action) {
  try {
    const activityRef = doc(
      collection(db, "users", ProfileState.user.uid, "activityLogs")
    );
    await setDoc(activityRef, {
      action: action,
      timestamp: serverTimestamp(),
      details: {},
    });
  } catch (error) {
    console.error("[Profile] Error logging activity:", error);
  }
}

// Cleanup listeners
window.addEventListener("beforeunload", () => {
  ProfileState.listeners.forEach((unsubscribe) => unsubscribe());
});

// Helper Functions
function showLoading() {
  if (Elements.loadingIndicator)
    Elements.loadingIndicator.style.display = "block";
  if (Elements.profileContent) Elements.profileContent.style.display = "none";
}

function hideLoading() {
  if (Elements.loadingIndicator)
    Elements.loadingIndicator.style.display = "none";
}

function showError(message) {
  if (Elements.errorMessage) {
    Elements.errorMessage.textContent = message;
    Elements.errorMessage.style.display = "block";
  }
}
