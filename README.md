# Project Intro

This is Railway Reservation & Routing system.

**Old approach**  
`Monolithic DB system` : Implemented using SQL DB (PostgreSQL) only by aquiring Row level locks in DB with Serialized transactions.

**Currently implementing**  
`Polyglot Persistence system` : Utilizing Neo4j for Routing queries & PostgreSQL for general queries like user data. Redis Redlock for distributed locking of resorces/data as this is a multi database system.

## Old Schemas

- `trains` : **[** train_id, train_name, source , destination, timing **]**
- `coaches` : **[** id, train_id, coach_name , available_seats **]**
- `seats` : **[** id, seat_number, coach_id, booking_id **]**
- `bookings` : **[** id, user_id, train_id , source, destination, coach_name, number_of seats **]**
- `users` : **[** user_id, name, password **]**
- `admin` : **[** keys **]**

## New Workflow & Schema

**Transaction Workflow :**
![Transaction Workflow Image](https://github.com/MANURAJ7/Railway_Booking_Task/blob/main/README_images/workflow/transaction.png)

**Query Workflow :**
![Query Workflow Image](https://github.com/MANURAJ7/Railway_Booking_Task/blob/main/README_images/workflow/Get_trains.png)

**Relation between Stations :**
![Relation between Stations Image](https://github.com/MANURAJ7/Railway_Booking_Task/blob/main/README_images/database/station_to_station.png)

**Relation between Station & Seats :**
![Relation between Stations & Seats Image](https://github.com/MANURAJ7/Railway_Booking_Task/blob/main/README_images/database/station_to_seat.png)
