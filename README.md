# Udacity Neighbourhood Map Project

Fourth project in Udacity's Full Stack Nanodegree is **Neighbourhood Map Project**. We are asked to create a single page web application usinng **`Knockout.js`** and preffered 3rd party Map application. I decided to use **Google Maps JavaScript Library**

 > Click [here](http://185.137.92.115:8000) for live app.

## Application
I'm a regular user of London underground services, therefore I wanted to create a web app, focused on London Train Stations, managed by [TFL](https://tfl.gov.uk) (Transport for London).

This app queries API for London Train Stations data when a user is connected, and displays the results on the sidebar as well as on the map.

Users can:
 - list all train stations along with Zone information. All Stations are displayed on the map.
 - filter stations by typing into filter box, either on sidebar or on the navbar
 - toggle sidebar by clicking hamburger icon (hamburger icon also toggles the filter box on navbar).
 - click on markers and get station name and zon information.
 - click on station names and will be focusing on that particular station


 Filtering results also changes the map zoom level and center. This way users do not need to constantly zoom.

## Frameworks & Data
 - `Google Maps JavaScript` library was used for showing filtered results on the map.
 - `Knockout.js` was used as the organizational library, (MVVM)
 - `jQuery` was used for AJAX calls to data as well as sidebar toggling. `jQuery` is also used by `Bootstrap`
 - `Bootstrap 4` was used for styling the web app and making it mobile friendly and responsive. Further CSS customization is done in `style.css` file
 - Data for TFL stations was available at [Marquis de Geek web site](http://marquisdegeek.com/api/tube/) as a JSON file.

# Credits
- Udacity Google Maps Course. I used few exampled fgrom there, like infoWindow and markers.
- London Station Data is queried from[Marquis de Geek](http://marquisdegeek.com/api/tube/) web site. Kudos to him.
- Finally, my sidebar design was influenced from one of [Bootstrapious](https://bootstrapious.com/p/bootstrap-sidebar) examples. Thanks for the inspiration.

# Notes:
Google Maps API KEY is secured for [live app](http://185.137.92.115:8000) and the one in github is also secured and can only work from `http://127.0.0.1:5500` (VSCODE live server). If you download and you receive an error on Map screen either use VSCODE live server and run on port `5500` or use your Google Maps API key.

Mehmet Oner Yalcin
