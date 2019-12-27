# Time Tracking

* Previous version in Angular - about 5 hrs before deciding to use simpler format

| Date          | Hours         |
| ------------- |:-------------:|
| 4-12-19       | 2             |
| 4-13-19       | 6             |
| 4-27-19       | 3             |
| 4-28-19       | 8             |
| 5-11-19       | 2             |
| 6-13-19       | 2             |
| 6-22-19       | 3             |
| July **       | some research |
| 8-7-19        | 3             |
| 8-28-19       | 2             |
| 9-4-19        | 4             |
| 9-12-19       | 2             |
| 9-14-19       | 2             |
| 9-21-19       | 7             |
| 9-23-19       | 2             |
| 9-26-19       | 2             |
| 9-27-19       | 3             |
| 12-23-19      | 2             |
| 12-25-19      | 2             |
|               |               |
|               |               |


## Notes/ToDo

* Look into fade effect for the lower parts of the front page mini articles
* Hover effect on pic links on index is odd on mobile

* [x] copy header nav to all pages  
  * [x] home  
  * [x] about  
  * [x] contact  
  * [x] ca  
  * [x] nz  
  * [x] usa  
  * [x] studyingAbroad  
* [x] make active link in small header noticeable  


* [x] _USA - HIDE USA FOR NOW_  
  * [x] add school cards/images  
  * [x] ~*fix* school card images~ images not consistent in clarity  
  * [x] swap images to icons  
  * [ ]add new card images  

* [ ] _Canada_  
  * [ ] FIX tabbed layout for media/small screens
  * [x] unify styles with NZ (icons/paragraphs)  
  * [x] dynamic province map  
  * [x] tabbed layout - main  
  * [x] tabbed layout - BC  
  * [ ] indiv. schools: BC  
    * [x] Vancouver Island Tab  
      * [x] Gulf  
      * [x] Qualicum  
      * [x] Sooke  
    * [x] Vancouver Tab  
      * [x] Maple Ridge/Pitt Meadows  
      * [x] Richmond  
      * [x] Rocky Mountain  
    * [x] Burnaby Tab  
    * [x] Delta Tab  
    * [x] Vernon Tab  
  * [ ] Rest of Canada - main tabs  
    * [x] Alberta Tab  
      * [ ] Medicine Hat SD  
    * [x] Ontario Tab  
      * [ ] Ottawa Carleton School Board  
    * [x] Quebec Tab  
      * [ ] Eastern Township  
    * [x] Newfoundland and Labrador  
      * [ ] Newfoundland and Labrador NISEP  
    * [x] New Brunswick  
      * [ ] New Brunswick French International Student Program  
* [ ] video responsiveness  
* [ ] add videos to learn more sections where available - ||||
* [ ] add brochures to learn more sections where available
* [x] add full page for why study abroad  
* [ ] content for above full page  
* [x] add 'captions' to other homepage images (see NZ)  
* [ ] footer with social links  
* [x] copy footer to all pages  
  
* [ ] _form!_  
* [ ] db  
* [ ] format images  
* [ ] hover/links on home location images and headers - fix responsiveness of text  
  
## It looks like we will need an API to send the emails

### ToDos and Notes for the API/Mail Service

* Plain HTML/CSS/JS/Jquery cannot send mail, it can only provide a mailto link - this will only open a user's mail service and allow them to send a free form email. It fails if the settings on your device don't have a default mail service, and it will not allow us to gather the information we want or (possibly) send a from reply email.
* Because of the above, I will build out a nodeJS service that will run separately to handle parsing form input and sending out an email. (An API)
* Current plan is to use NodeMailer and heroku.
