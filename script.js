const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const searchInput = document.getElementById('search-input');

// Event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

// Enter key support
searchInput.addEventListener('keypress', function (e) {
    if (e.key === "Enter") {
        getMealList();
    }
});


// ===============================
// Get meal list (Multiple Ingredients Support)
// ===============================
function getMealList() {
    let searchInputTxt = searchInput.value.trim();

    if (!searchInputTxt) {
        mealList.innerHTML = "Please enter at least one ingredient.";
        mealList.classList.add('notFound');
        return;
    }

    // Split ingredients by comma
    let ingredients = searchInputTxt
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== "");

    let allMeals = [];

    // Loading text
    mealList.innerHTML = "Loading...";
    mealList.classList.remove('notFound');

    Promise.all(
        ingredients.map(ingredient =>
            fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
                .then(res => res.json())
        )
    )
    .then(results => {

        results.forEach(data => {
            if (data.meals) {
                allMeals = [...allMeals, ...data.meals];
            }
        });

        // Remove duplicates using Map
        const uniqueMeals = Array.from(
            new Map(allMeals.map(meal => [meal.idMeal, meal])).values()
        );

        displayMeals(uniqueMeals);
    })
    .catch(error => {
        console.error('Error fetching meal list:', error);
        mealList.innerHTML = "Something went wrong. Please try again.";
        mealList.classList.add('notFound');
    });
}


// ===============================
// Display Meals
// ===============================
function displayMeals(meals) {
    let html = "";

    if (meals.length > 0) {
        meals.forEach(meal => {
            html += `
                <div class="meal-item" data-id="${meal.idMeal}">
                    <div class="meal-img">
                        <img src="${meal.strMealThumb}" alt="food">
                    </div>
                    <div class="meal-name">
                        <h3>${meal.strMeal}</h3>
                        <a href="#" class="recipe-btn">Get Recipe</a>
                    </div>
                </div>
            `;
        });
        mealList.classList.remove('notFound');
    } else {
        html = "Sorry, we didn't find any meal!";
        mealList.classList.add('notFound');
    }

    mealList.innerHTML = html;
}


// ===============================
// Get recipe of selected meal
// ===============================
function getMealRecipe(e) {
    e.preventDefault();

    if (e.target.classList.contains('recipe-btn')) {
        let mealItem = e.target.closest('.meal-item');

        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
            .then(response => response.json())
            .then(data => mealRecipeModal(data.meals))
            .catch(error => console.error('Error fetching recipe:', error));
    }
}


// ===============================
// Create Recipe Modal
// ===============================
function mealRecipeModal(meal) {
    meal = meal[0];

    let html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>

        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>

        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>

        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">
                Watch Video
            </a>
        </div>
    `;

    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
}
