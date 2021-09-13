const api_key = "70afb3b3";
const api_url_search = "http://www.omdbapi.com/?apikey=" + api_key + "&s=";
const api_url_movie_info = "http://www.omdbapi.com/?apikey=" + api_key + "&i=";
var movieSearch = "";
var myListPage = 1;
var movie;
// Učitavanje tabova
function openTab(evt, tabName, imdbid = "N/A") {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if (document.getElementById('myList').style.display == "block") {
        loadMyListMovies()
    }
    if (imdbid != "N/A") {
        getDataFromAPI(api_url_movie_info, 1, imdbid)
    }
}
// Učitavanje filmova u pretrazi i pozivanje funkcije za učitavanje iste
function searchMovies(searchBox, page = 1) {
    if (searchBox.length >= 3) {
        document.getElementById('movieList').style.visibility = "visible";
        getDataFromAPI(api_url_search + searchBox + "&page=", page)
        movieSearch = api_url_search + searchBox + "&page=", page;
    } else document.getElementById('movieList').innerHTML = `<div class="alert alert-dark" role="alert">Length must be at least 3 characters</div>`
}

// funkcija za učitavanje filmova i u zavisnosti da li je potrebno učitati jedan ili više vraća rezultat
async function getDataFromAPI(url, page = 1, imdbid = "N/A") {
    var pageMovies = "";
    if (imdbid == "N/A")
        var finalurl = url + page;
    else finalurl = url + imdbid;
    const response = await fetch(finalurl);
    var data = await response.json();
    if (data.Response == "True") {
        if (imdbid == "N/A") {
            deleteContent();
            for (let i = 0; i < data.Search.length; i++) {
                pageMovies = pageMovies + makeMiniMovie(data.Search[i].imdbID, data.Search[i].Poster, data.Search[i].Title, data.Search[i].Year);
            }
            document.getElementById('movieList').innerHTML = pageMovies + pageButtonMenager(page, data.totalResults / 10);
        } else {
            movie = data;
            //Provjera da li je film u omiljenim kako bi se dugme za dodavanje ili brisanje moglo prilagoditi
            if (loadMyListMoviesToArray().indexOf(movie.imdbID) >= 0) {

                var movieInMyList = `<button id="saveDeleteMovie" onclick=bookmarkManager(movie) type="button " class="btn btn-dark">Remove</button>`;
            } else {
                var movieInMyList = `<button id="saveDeleteMovie" onclick=bookmarkManager(movie) type="button " class="btn btn-dark">Add to my list</button>`;
            }
            // Nakon učitavanja infomacija o filmu, postavljaju se u odgovarajući odjeljak 
            if (data.Poster != "N/A") var img = data.Poster
            else var img = 'Pictures/noimage.jpg';
            document.getElementById('moreInfo').innerHTML = `
            <div class="container">
            <div class="row"><div id="title" class="col h2">` + data.Title + `</div></div>
            <div class="row"><div id='year' class="col text-muted text-left" style="font-size: 12px;">` + data.Year + `</div></div>
            <div class="row"><div class="col"><img id='` + data.imdbID + `picture' src="` + img + `" alt="Poster Image" onerror='defaultPoster(this.id)'></div></div>
            <div class="row mt-4"><div id='released' class="col">Released: ` + data.Released + `</div></div>
            <div class="row"><div id="director" class="col">Director ` + data.Director + `</div></div>
            <div class="row"><div id="actors" class="col">Actors: ` + data.Actors + `</div></div>
            <div class="row"><div id="plot" class="col">Plot: ` + data.Plot + `</div></div>
            <div class="col p-3 text-end">` + movieInMyList + `  </div>
          </div>`
        }
    }
    if (data.Response == "False") {
        document.getElementById('movieList').innerHTML = `<div class="alert alert-dark" role="alert">` + data.Error + `</div>`
    }
}
//Sprečava da dođe do sporog odgovora API-a da se ne mješaju funkcije
function deleteContent() {
    document.getElementById('movieList').innerHTML = '';
    document.getElementById('moreInfo').innerHTML = '';
}
//U slučaju da slika nije učitava se ova slika
function defaultPoster(id) {
    document.getElementById(id).src = 'Pictures/noimage.jpg';
}
//Kreiranje svakog filma sa svim potrebnim elementima u zavisnosti da li je to za pretragu ili listu omiljenih
function makeMiniMovie(imdbid, poster = 'Pictures/noimage.jpg', title, year = 'N/A', isMyList = false) {
    if (poster == "N/A") poster = 'Pictures/noimage.jpg';
    var sign = "";
    //Provjera da li je znak potrebno da bude zvjezdica ili dugme u zavisnosti na kojoj smo stranici kao i da li je uopšte potrebna zvjezdica
    if (isMyList == false && loadMyListMoviesToArray().indexOf(imdbid) >= 0) {
        sign = `<span id='star' class="fa fa-star checked"></span>`;
    } else if (isMyList != false) sign = `<button type="button" id=` + imdbid + ` onclick=bookmarkManager(this.id) class="btn btn-dark">Remove</button> `; {
        return `
    <div id=` + imdbid + ` class="container-fluid p-3" >
    <div class="row">
      <div  class="col-12 col-md-3 ">
        <img id="img" class="img-fluid rounded-start " src=` + poster + ` onclick="openTab(event,'movieInfo',this.parentNode.parentNode.parentNode.id)"  alt="Poster" onerror='defaultPoster(this.id)'>
      </div>
      <div class="col-9 ">
        <div class="row h-100 w-100 ">
          <div class="col-10">
            <div class="row h-100" >
              <div class="col-11 "onclick=openTab(event,'movieInfo',this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id) style="font-size: 16px; " >` + title + `</div>
              <div class="col-11  text-muted text-left h-100" onclick=openTab(event,'movieInfo',this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id)  style="font-size: 12px;">` + year + `</div>
            </div>
          </div>
          <div id= ` + imdbid + `star class="col-md-1  col-1  text-end my-auto mx-right " style="visibility: visible;">` + sign + `</div>
        </div>
      </div>
    </div>
  </div> `;
    }
}
//Upravljanje sa prikazom dugmadi za prethodnu i sledeću stranicu kao i da se ne prikazuje dugmeta ukoliko nije neki od uslova ispunjen
function pageButtonMenager(page = 1, endpage = 100, onClickAction = 'getDataFromAPI(movieSearch,this.value)') {
    var pageInt = parseInt(page);
    var pageButtonMenagerReturn = `<div id="buttons" class="container"><div class="row">`;
    if (parseFloat(page) > 1) {
        pageButtonMenagerReturn = pageButtonMenagerReturn + `<div class="col"> <button id="backPage" onclick="` + onClickAction + `" type="button " class="btn btn-dark" value=` + parseInt(pageInt - 1) + `>&lt Back</button> </div>`;
    }
    if (parseFloat(page) < parseFloat(endpage) && parseFloat(page) < 100) {
        pageButtonMenagerReturn = pageButtonMenagerReturn + `<div class="col text-end"> <button id="nextPage" onclick=` + onClickAction + ` type="button " class="btn btn-dark" value=` + parseInt(pageInt + 1) + `>Next></button> </div>`;
    }
    pageButtonMenagerReturn = pageButtonMenagerReturn + `</div></div>`;
    return pageButtonMenagerReturn

}
//Upravljaka funkcija koja učitava sve filmove iz liste omiljenih
function loadMyListMovies(page = 1) {
    var pageMyList = "";
    myListPage = page;
    var fistElementOfArray = 0;
    var lastElementOfArray = 0;
    MyListMoviesToArray = loadMyListMoviesToArray();
    var endpage = MyListMoviesToArray.length / 10;
    var pagination = pageButtonMenager(page, endpage, onClickAction = `loadMyListMovies(this.value)`);
    fistElementOfArray = page * 10 - 10;
    if (parseInt(page * 10) > MyListMoviesToArray.length) {
        lastElementOfArray = MyListMoviesToArray.length;
    }
    for (let i = fistElementOfArray; i < lastElementOfArray; i++) {
        var movieData = JSON.parse(localStorage.getItem(MyListMoviesToArray[i]));
        pageMyList = pageMyList + makeMiniMovie(movieData.imdbID, movieData.Poster, movieData.Title, movieData.Year, true);
    }
    document.getElementById('movieListOfMovies').innerHTML = pageMyList + pagination;
}
// Učitavanje elemenata u niz
function loadMyListMoviesToArray() {
    const movieIDsInLocalStorage = [];
    for (let i = 0; i < localStorage.length; i++) {
        movieIDsInLocalStorage.push(localStorage.key(i));
    }
    return movieIDsInLocalStorage;
}
//Snimanje i brisanje filmova iz lokalne memorije
function bookmarkManager(imdbID) {
    if (typeof (imdbID) == 'object') {
        if (loadMyListMoviesToArray().indexOf(imdbID.imdbID) >= 0) {
            localStorage.removeItem(imdbID.imdbID);
            document.getElementById('saveDeleteMovie').innerText = 'Add to my list';
            document.getElementById(imdbID.imdbID + 'star').innerHTML = ``;
        } else {
            localStorage.setItem(imdbID.imdbID, JSON.stringify(imdbID));
            document.getElementById('saveDeleteMovie').innerText = 'Remove';
            document.getElementById(imdbID.imdbID + 'star').innerHTML = `<span class="fa fa-star checked"></span>`;
        }
    } else {
        localStorage.removeItem(imdbID);
        loadMyListMovies(myListPage);
    }
}

document.getElementById("defaultOpen").click();