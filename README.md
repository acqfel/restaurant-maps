# Map of nearby restaurants to NEMO Museum
This project shows on a map, restaurants located near the NEMO Science Museum (Amsterdam, Netherlands).
On the right side of the site there is a list of restaurants and each symbol on Google Maps represents one of them. Clicking on one of the restaurants displays information such as address, photo, phone or website.

## How it was created and libraries used
The website was created using the following languages: HTML, CSS and Javascript.

### Libraries
* jQuery v3.2.1
* Knockout v3.4.2

### API
* Google Maps API
* Google Places API
* [**Eet.nu API**](https://docs.eet.nu)

### Compatible browsers
* Google Chrome
* Firefox

## How to see the restaurant map?
* Click [**here**](https://acqfel.github.io/restaurant-maps/) and will open the project site.
* To run the app locally, click in the green button "Clone or download" above and the right side, then "Download ZIP". Unzip and open index.html in a browser.
* 20 restaurants near NEMO Museum are displayed on the map. On the right side of the site the name of each of them are listed.

### Filtering the list of restaurants
* If the user types part of the name of a restaurant in the filter field, the list is updated and only those matches are displayed.

## How to view information from a restaurant?
The user has two options for this feature:
1. When you click on one of the symbols on the map, a window will open with the restaurant information: name, address, photo (Google Places API) and phone, website (Eet.nu API).
2. If the user clicks on one of the restaurants in the list, the same information window will be displayed.
