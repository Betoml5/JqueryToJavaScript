(async function load() {
    // await
    // action
    // terror
    // animation
    async function getData(url) {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        if (data.data.movie_count > 0) {
            return data;
            // Aqui termina mi funcion
        } else {
            //Si no hay peli, aqui continua

            throw new Error("No se encontro nigun resultado");
        }
    }

    const $home = document.getElementById("home");
    const $form = document.getElementById("form");
    const $featuringContainer = document.getElementById("featuring");

    function setAttributes($element, attributes) {
        for (const attribute in attributes) {
            $element.setAttribute(attribute, attributes[attribute]);
        }
    }

    const BASE_API = "https://yts.mx/api/v2/";

    function featuringTemplate(peli) {
        return `
                <div class="featuring">
                <div class="featuring-image">
                  <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
                </div>
                <div class="featuring-content">
                  <p class="featuring-title">Pelicula encontrada</p>
                  <p class="featuring-album">${peli.title}</p>
                </div>
              </div>
               
              `;
    }

    $form.addEventListener("submit", async (event) => {
        //debugger
        event.preventDefault();
        $home.classList.add("search-active");
        const $loader = document.createElement("img");
        setAttributes($loader, {
            src: "src/images/loader.gif",
            height: 50,
            width: 50,
        });
        $featuringContainer.append($loader);

        const data = new FormData($form);
        try {
            const {
                data: { movies: pelis },
            } = await getData(
                `${BASE_API}list_movies.json?limit=1&query_term=${data.get("name")}`
            );
            const HTMLString = featuringTemplate(pelis[0]);
            $featuringContainer.innerHTML = HTMLString;
        } catch (error) {
            alert(error.message);
            $loader.remove();
            $home.classList.remove("search-active");
        }
    });

    function videoItemTemplate(movie, category) {
        //Con DataSet puedo agregar datos a los tags HTML para luego usarlos de cualquier forma necesaria en JavaScript.
        //La forma de hacerlo es agregar un atributo “data-nombre” a cualquier tag html.

        //Ej:

        return `<div class="primaryPlaylistItem" data-id=${movie.id} data-category=${category}>
          <div class="primaryPlaylistItem-image">
            
            <img src="${movie.medium_cover_image}">
          </div>
          <h4 class="primaryPlaylistItem-title">
            ${movie.title}
            </h4>
            </div>`;
    }

    function createTemplate(HTMLString) {
        const html = document.implementation.createHTMLDocument();
        html.body.innerHTML = HTMLString;

        return html.body.children[0];
    }

    function addEventClick($element) {
        $element.addEventListener("click", () => {
            showModal($element);
        });
    }

    function renderMovieList(list, $container, category) {
        //actionList.data.movies
        $container.children[0].remove();
        list.forEach((movie) => {
            const HTMLString = videoItemTemplate(movie, category);
            const movieElement = createTemplate(HTMLString);
            $container.append(movieElement);
            const image = movieElement.querySelector("img");
            image.addEventListener("load", (event) => {
                event.srcElement.classList.add("fadeIn");
            });

            addEventClick(movieElement);
        });
    }

    async function cacheExist(category){
        const listName = `${category}List`
        const cacheList = localStorage.getItem(listName)
        if (cacheList) {
            return JSON.parse(cacheList);
        }
        const { data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`);
        localStorage.setItem(listName), JSON.stringify(data);
        return data;
    }

    // const { data: { movies: actionList }, } = await getData(`${BASE_API}list_movies.json?genre=action`);
    const actionList = await cacheExist('action')
    // localStorage.setItem('actionList', JSON.stringify(actionList))
    const $actionContainer = document.querySelector("#action");
    renderMovieList(actionList, $actionContainer, "action");

    const dramaList= await cacheExist('drama')
    const $dramaContainer = document.getElementById("drama");
    renderMovieList(dramaList, $dramaContainer, "drama");

    const animationList= await cacheExist('animation')
    const $animationContainer = document.getElementById("animation");
    renderMovieList(animationList, $animationContainer, "animation");

    
    const $modal = document.getElementById("modal");
    const $overlay = document.getElementById("overlay");
    const $hideModal = document.getElementById("hide-modal");

    const $modalTitle = $modal.querySelector("h1");
    const $modalImage = $modal.querySelector("img");
    const $modalDescription = $modal.querySelector("p");

    function findById(list, id) {
        return list.find((movie) => movie.id === parseInt(id, 10));
    }

    function findMovie(id, category) {
        switch (category) {
            case "action": {
                return findById(actionList, id);
            }
            case "drama": {
                return findById(dramaList, id);
            }
            default: {
                return findById(animationList, id);
            }
        }
    }

    function showModal($element) {
        $overlay.classList.add("active");
        $modal.style.animation = "modalIn .8s forwards";
        const id = $element.dataset.id;
        const category = $element.dataset.category;
        const data = findMovie(id, category);
        $modalTitle.textContent = data.title;
        $modalImage.setAttribute("src", data.medium_cover_image);
        $modalDescription.textContent = data.description_full;
    }

    $hideModal.addEventListener("click", hideModal);
    function hideModal(params) {
        $overlay.classList.remove("active");
        $modal.style.animation = "modalOut .8s forwards";
    }

    const $listFriendsContainer = document.getElementById("listFriends");
     

    async function getUsers(url) {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data;

       
    }

    

    function usersTemplate(user) {
        return `
         <li class="playlistFriends-item">
              <a href="#">
                <img src=${user.picture.thumbnail} alt=${user.name.first} />
                <span>
                    ${user.name.first}  ${user.name.last}
                </span>
              </a>
            </li>
         `;
    }

    function createUsersTemplate(HTMLString) {
        const html = document.implementation.createHTMLDocument();
        html.body.innerHTML = HTMLString;

        return html.body.children[0];
    }

    function renderUsersList(list, $container) {
        list.forEach((user) => {
            const HTMLString = usersTemplate(user);

            const userElement = createUsersTemplate(HTMLString);
            $container.append(userElement);
        });
    }

     const {
        results: usersList
     } = await getUsers(`${urlUsers}`);

     
   

     renderUsersList(usersList, $listFriendsContainer)

  

    
    const $sideBarPlayListContainer = document.getElementById('sideBarPlayList');
    const url_api_movies = 'https://yts.mx/api/v2/list_movies.json';

    

  


    async function getUserPlayList(url){
        const response = await fetch(url)
        const data = await response.json();
        return data;
        
    }

    const {data:{movies: moviePlayList}}  = await getUserPlayList(url_api_movies);
    

    function userPlayListTemplate(movie){
        return (
            `
            <li class="myPlaylist-item">
              <a href=${movie.url}>
                <span>
                  ${movie.title}
                </span>
              </a>
            </li>
            `
        );
    }

    function createPlayListTemplate(HTMLString){
        const html = document.implementation.createHTMLDocument();
        html.body.innerHTML = HTMLString;

        return html.body.children[0];
    }

    function renderUserPlayList(list, $container) {
        list.forEach((movie) => {
            const HTMLString = userPlayListTemplate(movie);

            const userPlayList = createPlayListTemplate(HTMLString);
            $container.append(userPlayList);
        });
    }

    
    
    renderUserPlayList(moviePlayList, $sideBarPlayListContainer);

  

    




})();
