const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.createElement('div');
mealDetailsContent.className = 'meal-details-content';
document.body.appendChild(mealDetailsContent);
const searchInput = document.getElementById('search-input');

// Event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', handleMealClick);
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        getMealList();
    }
});

// Display meals matching the search input
function getMealList() {
    const searchInputTxt = searchInput.value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
        .then(response => response.json())
        .then(data => {
            let html = "";
            if (data.meals) {
                data.meals.forEach(meal => {
                    html += `
                        <div class="meal-item" data-id="${meal.idMeal}">
                            <div class="meal-img">
                                <img src="${meal.strMealThumb}" alt="food">
                            </div>
                            <div class="meal-name">
                                <h3>${meal.strMeal}</h3>
                                <button class="favorite-btn" data-id="${meal.idMeal}">♡</button>
                                <button class="recipe-btn">Get Recipe</button>
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
        });
}

// Handle click events for recipe and favorite buttons
function handleMealClick(e) {
    e.preventDefault();
    const mealItem = e.target.closest('.meal-item');
    if (e.target.classList.contains('recipe-btn')) {
        const mealId = mealItem.getAttribute('data-id');
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
            .then(response => response.json())
            .then(data => showRecipeModal(data.meals[0]));
    } else if (e.target.classList.contains('favorite-btn')) {
        toggleFavorite(e.target);
    }
}

document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('meal-details').classList.remove('showRecipe'); // Close the modal
});

// Display modal with meal details
// Display modal with meal details
function showRecipeModal(meal) {
    const mealDetails = document.getElementById('meal-details');
    mealDetails.classList.add('showRecipe'); // Show the modal

    const mealDetailsContent = document.querySelector('#meal-details-content');
    mealDetailsContent.innerHTML = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-video">
            <h3>Watch the Recipe Video:</h3>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${getYouTubeId(meal.strYoutube)}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <button class="close-modal-btn">Close</button>
    `;

    // Close button event
    mealDetails.querySelector('.close-modal-btn').addEventListener('click', () => {
        mealDetails.classList.remove('showRecipe'); // Hide the modal
    });
}

// Extract YouTube video ID from the URL
function getYouTubeId(url) {
    const urlParts = url.split('v=');
    return urlParts[1].split('&')[0]; // Get the video ID after 'v='
}



// Toggle favorite meals and store in local storage
function toggleFavorite(button) {
    const mealId = button.getAttribute('data-id');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.includes(mealId)) {
        favorites = favorites.filter(id => id !== mealId);
        button.textContent = '♡'; // Not favorited
    } else {
        favorites.push(mealId);
        button.textContent = '❤️'; // Favorited
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Load favorites on page load
window.addEventListener('load', function() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    
    favoriteBtns.forEach(button => {
        if (favorites.includes(button.getAttribute('data-id'))) {
            button.textContent = '❤️'; // Mark as favorited
        } else {
            button.textContent = '♡'; // Not favorited
        }
    });
});
