const recipesContainer = document.getElementById('recipesContainer');
const searchInput = document.getElementById('searchInput');

// وظيفة جلب البيانات من API
async function fetchRecipes() {
    try {
        const response = await fetch('https://dummyjson.com/recipes');
        const data = await response.json();
        displayRecipes(data.recipes);
    } catch (error) {
        recipesContainer.innerHTML = `<p>Error loading recipes. Please try again later.</p>`;
        console.error("Fetching error:", error);
    }
}

// وظيفة عرض الوصفات في الصفحة
function displayRecipes(recipes) {
    recipesContainer.innerHTML = ''; // مسح محتوى التحميل

    recipes.forEach(recipe => {
        const recipeHTML = `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
                <div class="recipe-info">
                    <h3>${recipe.name}</h3>
                    <p><span class="ingredients-label">Ingredients:</span> ${recipe.ingredients.join(', ')}</p>
                    <a href="#" class="view-more">View More</a>
                </div>
            </div>
        `;
        recipesContainer.innerHTML += recipeHTML;
    });
}

// وظيفة البحث (لتصفية الوصفات المعروضة)
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const allCards = document.querySelectorAll('.recipe-card');

    allCards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        if (title.includes(term)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// تشغيل الجلب عند فتح الصفحة
fetchRecipes();