# Project Intro

This is Railway Ticket Bookings Site build using Node.js backend, React,js front end and Postgres DB.

## Roles

**USER :**

- Login with id password gettings JWT token for auth.
- Search Trains between two stations getting details [train_is, train_name, timing] availability [coach_id, available_seats]
- Able to book seats in particular coaches of a train.

**ADMIN :**

- Login with API key getting access token.
- Able to add craete new trains and set their available seats.

# Tables & Schemas

- `trains` : **[** train_id, train_name, source , destination, timing **]**
- `coaches` : **[** id, train_id, coach_name , available_seats **]**
- `seats` : **[** id, seat_number, coach_id, booking_id **]**
- `bookings` : **[** id, user_id, train_id , source, destination, coach_name, number_of seats **]**
- `users` : **[** user_id, name, password **]**
- `admin` : **[** keys **]**

# Implementation Details

- `Real time updates` are served using web socket connections where user joins the specific rooms of the trains he has searched for on a booking event the updates are shared with all the users who have searched the particular train .
- `Handling Race condition` : To handle multiple users making booking transactions at the same time the booking transactions are executed under _SERIALIZED ISOLATION LEVEL_ this will use row level locks so only the particualar coach/s of a train will be locked .
