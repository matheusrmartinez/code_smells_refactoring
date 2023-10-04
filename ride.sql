create table cccat13.ride (
ride_id uuid,
passenger_id uuid,
driver_id uuid,
status text,
fare numeric,
distance numeric,
from_lat numeric,
from_long numeric,
to_lat numeric,
to_long numeric,
date timestamp,
CONSTRAINT fk_passenger
    FOREIGN KEY (passenger_id)
        REFERENCES account(account_id)
CONSTRAINT fk_driver
    FOREIGN KEY (driver_id)
        REFERENCES account(account_id)
);