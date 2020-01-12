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
| 12-26-19      | 3             |
| 12-30-19      | 3             |
| 01-02-20      | 3             |
| 01-03-20      | 2             |
| 01-04-20      | 10            |
| 01-05-20      | 7             |
| 01-07-20      | 2             |
| 01-08-20      | 2             |
| 01-09-20      | 2             |
|               |               |
| *Total*       |            91 |
---
| Invoiced      |   91/25 = 2275|
---
| 01-11-20      | 2             |
| 01-12-20      |               |
|               |               |
| *Total*       |             2 |



## It looks like we will need an API to send the emails

* Plain HTML/CSS/JS/Jquery cannot send mail, it can only provide a mailto link - this will only open a user's mail service and allow them to send a free form email. It fails if the settings on your device don't have a default mail service, and it will not allow us to gather the information we want or (possibly) send a from reply email.
* Because of the above, I will build out a nodeJS service that will run separately to handle parsing form input and sending out an email. (An API)
* Current plan is to use NodeMailer and heroku.

_Current status - local api has successfully delivered a test email._

* Need to build out form, format email, and connect the information to the api.
* Need to push API live after the above
* Currently finishing out the content for Canada before returning to this

---

* Refactor of existing districts to show individual schools (or top schools in the case of more than ~10)
  * [x]- BC complete

* Refactor videos for load on click to speed up page load
  * [x]- Existing videos for all BC are refactored to load on click. Function tested, will be used going forward.

#### ToDo FOr MVP(minimum viable product/ok to go live for users)


* Complete remaining sections/districts (details in emails)

* API (brief notes above)

* Set up USA/NZ with coming soon messages

* Build a 'back' or 'close' type button to ease navigation from an open district

* A bunch of small style/usability fixes, detailed in my notes

#### Stretch/future possible additions

* Format images to uniform size to ease load times (this will take some time in Photoshop - the files themselves need adjusting in order to change load)

* Hook app to a database to track contacts

* Find cools ways to create a 'favorite' or 'compare' list of schools/districts - _this would be a big project, likely requiring a pretty large refactor_

* If db implemented, create admin dashboard for ease of information visibility - _this would be a separate app, for Aunt Alex's use, connected to the database_